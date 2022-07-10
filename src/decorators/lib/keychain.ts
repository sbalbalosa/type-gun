import { generateRandomKey, fetchUser, getSea, reduceFields } from '../../helpers';
import { field, edge } from '../index';
import { setupEdges } from '../edge';
import MapQuery from '../query/map';
import linkMixin from '../mixins/link';
import multipleMixin from '../mixins/multiple';
import Metadata from './metadata';
import Read from './read';
import Keys from './keys';
import Properties from './properties';
import { getEncrypteds } from '../encrypted';

const sea = getSea();

@linkMixin
@multipleMixin
export default class Keychain {
    @field
    pub?: string;

    @field
    epub?: string;

    @edge(() => Keys)
    keys?: MapQuery;

    @edge(() => Read)
    read?: MapQuery;

    userInstance?: null;
    targetConstructor?: null;

    static async create(userNode, constructor) {
        const fetchAuthority = Keychain.prototype.fetchAuthority.bind({
          userInstance: userNode
        });
        const authority = fetchAuthority();
        const metadata = Metadata.create(userNode);
        metadata.pub = authority.pub;
        await metadata.save();

        const keychain = new Keychain();
        keychain.parentNode = metadata;
        keychain.setId = keychain.constructor.name.toLowerCase();
        keychain.userInstance = userNode;
        keychain.pub = authority.pub;
        keychain.epub = authority.epub;
        keychain.targetConstructor = constructor;
        await keychain.save();

        await keychain.generatePropertyKeys();
        return setupEdges(keychain);
    }

    fetchAuthority () {
        if (!this.userInstance?._?.sea) throw new Error('No assigned authority');
        return this.userInstance?._?.sea;
    }

    async generatePropertyKeys() {
        const authority = this.fetchAuthority();

        const fields = getEncrypteds(this.targetConstructor);
        const savePromise = fields.map(async (field) => {
            const randomKey = await generateRandomKey();
            const node = Keys.create(this, field);
            node.key = await sea.encrypt(randomKey, authority);
            await node.save();
        });

        await Promise.all(savePromise);
        return this;
  }

  async grantReadProperty(property: string, pair) {
    if (!pair.pub) throw new Error('No public key'); // TODO: create a helper method to check validity of pair
    const propertyAccess = await this.fetchPropertyAccess(pair, property);
    return !!propertyAccess;
  }

  async revokeReadProperty(property: string, pair) {
    const propertyAccess = await this.fetchPropertyAccess(pair, property);
    await propertyAccess.remove();
    return true;
  }

  async grantReadAllProperty(pub: string) {
    const fields = getEncrypteds(this.targetConstructor);
    const savePromise = fields.map(async (field) => {
        await this.grantReadProperty(field, pub);
    });
    await Promise.all(savePromise);
    return this;
  }

  async revokeReadAllProperty(pub: string) {
    const fields = getEncrypteds(this.targetConstructor);
    const removePromise = fields.map(async (field) => {
        await this.revokeReadProperty(field, pub);
    });
    await Promise.all(removePromise);
    return this;
  }

  async fetchPropertyAccess (pair, property: string) {
    const readAccess = await this.fetchReadAccess(pair);
    const authority = this.fetchAuthority();
    const key = await this.fetchPropertyKey(property);

    let propertyAccess = await readAccess.properties.fetchById(property);
    if (!propertyAccess) {
      propertyAccess = Properties.create(readAccess, property);
    };
    propertyAccess.key = await sea.encrypt(key, await sea.secret(pair.epub, authority)); // TODO: create a helper method
    await propertyAccess.save();
    return propertyAccess;
  }

  async fetchReadAccess(pair) {
    // TODO: check priv and pub
    const user = pair.priv ? pair : await this.fetchUser(pair.pub);
    let readAccess = await this.read.fetchById(user.pub);
    if (!readAccess) {
      readAccess = Read.create(this, user.pub);
      readAccess.pub = user.pub;
      readAccess.epub = user.epub;
      await readAccess.save();
    };
    return readAccess;
  }

   async fetchUser(pub: string) {
    const shareUser = await fetchUser(pub);
    if (!shareUser) throw new Error('No user found');
    return shareUser;
  }

   async fetchPropertyKey(property: string) {
    const propertyNode = await this.fetchProperty(property);
    const authority = this.fetchAuthority();
    await propertyNode.sync();
    const data = await sea.decrypt(propertyNode.key, authority);
    return data;
  }

  async fetchProperty(property: string) {
    const propertyNode = await this.keys.fetchById(property);
    if (!propertyNode) throw new Error('No property node');
    return propertyNode;
  }

   async sharedReadProperties(sharedAuthority) {
    const fields = getEncrypteds(this.targetConstructor);
    return reduceFields(fields, async (field) => {
        const propertyAccess = await this.fetchPropertySharedAccess(sharedAuthority, field);
        const encryptedValue = await this.raw(); // TODO: add a helper to get raw encrypted fields 
        if (!(encryptedValue && encryptedValue[field])) throw new Error('No encrypted value');
        const decryptedKey = await sea.decrypt(propertyAccess.key, await sea.secret(keychain.epub, sharedAuthority));
        const decryptedValue = await sea.decrypt(encryptedValue[field], decryptedKey);
        return decryptedValue;
    })
  }

  async fetchPropertySharedAccess(pair, property) {
    const readAccess = await this.fetchReadAccess(pair);
    const propertyAccess = await readAccess.properties.fetchById(property);
    if (propertyAccess) return propertyAccess;
    throw new Error(`No access to property ${property}`);
  }
}