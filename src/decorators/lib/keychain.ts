import { generateRandomKey, fetchUser, getSea } from '../../helpers';
import { field, edge } from '../index';
import { setupEdges } from '../edge';
import MapQuery from '../query/map';
import linkMixin, { childLinkMixin } from '../mixins/link';
import mapMixin from '../mixins/map';
import baseMixin from '../mixins/base';
import Metadata from './metadata';
import Read from './read';
import Keys from './keys';
import Properties from './properties';
import { getEncrypteds } from '../encrypted';

const sea = getSea();

@baseMixin
@linkMixin
@mapMixin
@childLinkMixin
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

        const keychain = Keychain.createInstance(metadata, constructor.name.toLowerCase());
        keychain.userInstance = userNode;
        keychain.pub = authority.pub;
        keychain.epub = authority.epub;
        keychain.targetConstructor = constructor;
        await keychain.save();

        await keychain.generatePropertyKeys();
        return setupEdges(keychain);
    }

    private static createInstance(node, id) {
      const instance = new Keychain();
      instance.initMapDefaults();
      instance.parentNode = node;
      instance.gunId = id;
      instance.mapId = Keychain.name.toLowerCase();
      return instance;
    }

    fetchAuthority () {
        if (!this.userInstance?._?.sea) throw new Error('No assigned authority');
        return this.userInstance?._?.sea;
    }

    // TODO: create a way to regenerate keys

    async generatePropertyKeys() {
        const authority = this.fetchAuthority();

        const fields = getEncrypteds(this.targetConstructor);
        const savePromise = fields.map(async (field) => {
            const node = Keys.create(this, field);
            await node.sync();
            if (node.key) return;
            const randomKey = await generateRandomKey();
            node.key = await sea.encrypt(randomKey, authority);
            await node.save();
        });

        await Promise.all(savePromise);
        return this;
  }

  async grantRead(property: string, pair) {
    if (!pair.pub) throw new Error('No public key'); // TODO: create a helper method to check validity of pair
    const propertyAccess = await this.fetchPropertyAccess(pair, property);
    return !!propertyAccess;
  }

  async revokeRead(property: string, pair) {
    const propertyAccess = await this.fetchPropertyAccess(pair, property);
    await propertyAccess.remove();
    return true;
  }

  async grangReadAll(pair) {
    const fields = getEncrypteds(this.targetConstructor);
    const savePromise = fields.map(async (field) => {
        await this.grantRead(field, pair);
    });
    await Promise.all(savePromise);
    return this;
  }

  async revokeReadAll(pair) {
    const fields = getEncrypteds(this.targetConstructor);
    const removePromise = fields.map(async (field) => {
        await this.revokeRead(field, pair);
    });
    await Promise.all(removePromise);
    return this;
  }

  /*
    generate keys for a property to be shared to the input pair
    OWNER only
  */
  async fetchPropertyAccess (pair, property: string) {
    await this.sync();
    if (!this.isAuthorityOwner()) throw new Error('Authority not an owner');
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

  /*
   get the master key node for a property 
  */
  async fetchProperty(property: string) {
    const propertyNode = await this.keys.fetchById(property);
    if (!propertyNode) throw new Error('No property node');
    return propertyNode;
  }

  /*
    decrypt the master key or the share key for a property
    Owner or share
  */
   async fetchPropertyKey(property: string) {
    await this.sync(); // TODO: check if this is really needed.
    const authority = this.fetchAuthority();
    if (this.isAuthorityOwner()) {
      const propertyNode = await this.fetchProperty(property);
      await propertyNode.sync();
      return await sea.decrypt(propertyNode.key, authority);
    }

    const readAccess = await this.read.fetchById(authority.pub);
    if (!readAccess) throw new Error('No read access');

    const propertyAccess = await readAccess.properties.fetchById(property);
    if (!propertyAccess) throw new Error('No property access');

    const key = await sea.decrypt(propertyAccess.key, await sea.secret(this.epub, authority));
    return key
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

  isAuthorityOwner() {
    const authority = this.fetchAuthority();
    return authority.pub === this.pub;
  }
}