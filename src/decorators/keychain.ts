import { generateRandomKey, fetchUser, getSea } from "../helpers";
import Keychain from "./lib/keychain";
import Keys from "./lib/keys";
import Properties from "./lib/properties";
import SingleQuery from './query/single';
import { getEncrypteds } from "./encrypted";

const sea = getSea();

export default function keychain(constructor: Function) {
  constructor.prototype.hasAttachedKeychain = true;
  constructor.prototype.authority = null;
  constructor.prototype.keychain = new SingleQuery(constructor.prototype, Keychain);


  constructor.prototype.grantRead = async function(property: string, pub: string) {
    if (!(await this.isKeychainExist())) throw new Error('No keychain');
    if (!this.authority) throw new Error('No authority');

    const shareUser = await fetchUser(pub);
    if (!shareUser) throw new Error('No user');


   if(await this.isReadExist()) {
        const userReadAccess = await this.read.fetchById(shareUser.pub);
        if (userReadAccess) {
            const propertyAccess = Properties.create(userReadAccess, property);
            const propertyKey = await this.fetchPropertyKey(property);
            propertyAccess.key = generateRandomKey();
            await propertyAccess.save();
        }
   }




    //check if authority is same with keychain pub
  }

  constructor.prototype.revokeRead = async function(property: string, pub: string) {

  }

  constructor.prototype.grantReadAll = async function(pub: string) {

  }

  constructor.prototype.revokeReadAll = async function(pub: string) {

  }

  constructor.prototype.fetchPropertyKey = async function(property: string) {
    
    if (!(await this.isKeychainExist())) throw new Error('No keychain'); 
    const propertyNode = await keychain.keys.fetchById(property);
    if (!propertyNode) throw new Error('No key');
    await propertyNode.sync();
    const data = await sea.decrypt(propertyNode.key, this.authority);\
    return data;
  }

  constructor.prototype.isReadExist = async function() {
    if (await this.isKeychainExist()) throw new Error('No keychain');

    const keychain = await this.keychain.fetch();
    return await keychain.read.isExist();
  }

  constructor.prototype.isKeychainExist = async function() {
    const node = await this.keychain.fetch();
    return !!node;
  }

  constructor.prototype.createKeychain = async function() {
    if (!this.authority) throw new Error('No authority');

    const node = Keychain.create(this);
    node.pub = this.authority.pub;
    node.epub = this.authority.epub;
    await node.save();

    await this.generatePropertyKeys(node);
    return this;
  }

  constructor.prototype.generatePropertyKeys = async function(keychain) {
    if (!this.authority) throw new Error('No authority');

    const fields = getEncrypteds(constructor);
    const savePromise = fields.map(async (field) => {
        const randomKey = await generateRandomKey();
        const node = Keys.create(keychain, field);
        node.key = await sea.encrypt(randomKey, this.authority);
        await node.save();
    });

    await Promise.all(savePromise);
    return this;
  }
};
