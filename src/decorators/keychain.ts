import { generateRandomKey, fetchUser, getSea, reduceFields } from "../helpers";
import Keychain from "./lib/keychain";
import Keys from "./lib/keys";
import Read from "./lib/read";
import Properties from "./lib/properties";
import SingleQuery from './query/single';
import { getEncrypteds } from "./encrypted";

const sea = getSea();

//TODO: add support to sign and verify

export default function keychain(constructor: Function) {
  constructor.prototype.hasAttachedKeychain = true;
  constructor.prototype.authority = null;
  constructor.prototype.keychain = null;

  constructor.prototype.grantReadProperty = async function(property: string, pair) {
    if (!pair.pub) throw new Error('No public key'); // TODO: create a helper method to check validity of pair
    const propertyAccess = await this.fetchPropertyAccess(pair, property);
    return !!propertyAccess;
  }

  constructor.prototype.revokeReadProperty = async function(property: string, pair) {
    const propertyAccess = await this.fetchPropertyAccess(pair, property);
    await propertyAccess.remove();
    return true;
  }

  constructor.prototype.grantReadAllProperty = async function(pub: string) {
    const fields = getEncrypteds(constructor);
    const savePromise = fields.map(async (field) => {
        await this.grantReadProperty(field, pub);
    });
    await Promise.all(savePromise);
    return this;
  }

  constructor.prototype.revokeReadAllProperty = async function(pub: string) {
    const fields = getEncrypteds(constructor);
    const removePromise = fields.map(async (field) => {
        await this.revokeReadProperty(field, pub);
    });
    await Promise.all(removePromise);
    return this;
  }

  constructor.prototype.fetchPropertySharedAccess = async function(pair, property) {
    const readAccess = await this.fetchReadAccess(pair);
    const propertyAccess = await readAccess.properties.fetchById(property);
    if (propertyAccess) return propertyAccess;
    throw new Error(`No access to property ${property}`);
  }

  constructor.prototype.fetchPropertyAccess = async function(pair, property: string) {
    const readAccess = await this.fetchReadAccess(pair);
    const authority = await this.fetchAuthority();
    const key = await this.fetchPropertyKey(property);

    let propertyAccess = await readAccess.properties.fetchById(property);
    if (!propertyAccess) {
      propertyAccess = Properties.create(readAccess, property);
    };
    propertyAccess.key = await sea.encrypt(key, await sea.secret(pair.epub, authority)); // TODO: create a helper method
    await propertyAccess.save();
    return propertyAccess;
  }

  constructor.prototype.fetchPropertyKey = async function(property: string) {
    const propertyNode = await this.fetchProperty(property);
    const authority = await this.fetchAuthority();
    await propertyNode.sync();
    const data = await sea.decrypt(propertyNode.key, authority);
    return data;
  }

  constructor.prototype.encryptProperty = async function(property: string, data) {
    const key = await this.fetchPropertyKey(property);
    const encrypted = await sea.encrypt(data, key);
    return encrypted;
  }

  constructor.prototype.decryptProperty = async function(property: string, data) {
    const key = await this.fetchPropertyKey(property);
    const decrypted = await sea.decrypt(data, key);
    return decrypted;
  }

  constructor.prototype.fetchProperty = async function(property: string) {
    const keychain = await this.fetchKeychain();
    const propertyNode = await keychain.keys.fetchById(property);
    if (!propertyNode) throw new Error('No property node');
    return propertyNode;
  }

  constructor.prototype.fetchUser = async function(pub: string) {
    const shareUser = await fetchUser(pub);
    if (!shareUser) throw new Error('No user found');
    return shareUser;
  }

  constructor.prototype.fetchKeychain = async function() {
    const keychain = await this.keychain.fetch();
    if (!keychain) throw new Error('No keychain found');
    return keychain;
  }

  constructor.prototype.fetchReadAccess = async function(pair) {
    // TODO check priv and pub
    const keychain = await this.fetchKeychain();
    const user = pair.priv ? pair : await this.fetchUser(pair.pub);
    let readAccess = await keychain.read.fetchById(user.pub);
    if (!readAccess) {
      readAccess = Read.create(keychain, user.pub);
      readAccess.pub = user.pub;
      readAccess.epub = user.epub;
      await readAccess.save();
    };
    return readAccess;
  }

  constructor.prototype.fetchAuthority = async function() {
    if (!this.authority) throw new Error('No assigned authority');
    return this.authority;
  }

  constructor.prototype.createKeychain = async function(authority) {
    this.keychain = new SingleQuery(this, Keychain);
    const keychain = await this.keychain.fetch();
    // TODO if keychain already exist check if user is the same;
    this.authority = authority;
    if (keychain) return this;

    

    const node = Keychain.create(this);
    node.pub = authority.pub;
    node.epub = authority.epub;
    await node.save();

    await this.generatePropertyKeys(node);
    return this;
  }

  constructor.prototype.generatePropertyKeys = async function(keychain) {
    const authority = await this.fetchAuthority();

    const fields = getEncrypteds(constructor);
    const savePromise = fields.map(async (field) => {
        const randomKey = await generateRandomKey();
        const node = Keys.create(keychain, field);
        node.key = await sea.encrypt(randomKey, authority);
        await node.save();
    });

    await Promise.all(savePromise);
    return this;
  }

  constructor.prototype.sharedReadProperties = async function(sharedAuthority) {
    const keychain = await this.fetchKeychain();
    const fields = getEncrypteds(constructor);
    return reduceFields(fields, async (field) => {
        const propertyAccess = await this.fetchPropertySharedAccess(sharedAuthority, field);
        const encryptedValue = await this.raw(); // TODO: add a helper to get raw encrypted fields 
        if (!(encryptedValue && encryptedValue[field])) throw new Error('No encrypted value');
        const decryptedKey = await sea.decrypt(propertyAccess.key, await sea.secret(keychain.epub, sharedAuthority));
        const decryptedValue = await sea.decrypt(encryptedValue[field], decryptedKey);
        return decryptedValue;
    })
  }
};
