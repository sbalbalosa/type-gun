import { generateRandomKey, fetchUser, getSea } from '../../helpers';
import { field, edge } from '../index';
import { setupEdges } from '../edge';
import MapQuery from '../query/map';
import linkMixin, { childLinkMixin } from '../mixins/link';
import mapMixin from '../mixins/map';
import baseMixin from '../mixins/base';
import Metadata from './metadata';
import Read from './read';
import Properties from './properties';
import Keys from './keys';
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

    @edge(() => Properties)
    properties?: MapQuery;

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
            const property = Properties.create(this, field);

            await property.sync();
            const keyCount = await property.keys.length();
            if (keyCount > 0) return;
            property.name = field;
            await property.save();
            const key = Keys.create(property);
            const randomKey = await generateRandomKey();
            key.key = await sea.encrypt(randomKey, authority);
            await key.save();
        });

        await Promise.all(savePromise);
        return this;
  }

  async grantRead(property: string, pair) {
    if (!pair.pub) throw new Error('No public key'); // TODO: create a helper method to check validity of pair
    const propertyAccess = await this.createReadKeyAccess(pair, property);
    return !!propertyAccess;
  }

  async revokeRead(property: string, pair) {
    const propertyAccess = await this.createReadKeyAccess(pair, property);
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
  async createReadKeyAccess (pair, property: string) {
    if (!this.isAuthorityOwner()) throw new Error('Authority not an owner');
    const authority = this.fetchAuthority();
    const readAccess = await this.createReadAccess(pair);
    const ownerKeyAccess = await this.fetchOwnerKeyNode(property); // owner

    let propertyAccess = await readAccess.properties.fetchById(property);
    if (!propertyAccess) {
      propertyAccess = Properties.create(readAccess, property);
    };
    propertyAccess.name = property; // TODO: check if this still needed.
    await propertyAccess.save();

    let sharedKeyAccess = await propertyAccess.keys.fetchLast();
    if (!sharedKeyAccess) {
      sharedKeyAccess = Keys.create(propertyAccess);
    }
    const masterKey = await sea.decrypt(ownerKeyAccess.key, authority);
    sharedKeyAccess.key = await sea.encrypt(masterKey, await sea.secret(pair.epub, authority)); // TODO: create a helper method
    await sharedKeyAccess.save();
    await sharedKeyAccess.connect('master', ownerKeyAccess.childLink());
    return sharedKeyAccess;
  }

  /*
   get the master key node for a property 
  */

  async fetchOwnerKeyNode(property: string) {
    const propertyNode = await this.properties.fetchById(property);
    if (!propertyNode) throw new Error('No property node');
    const keyNode = await propertyNode.keys.fetchLast();
    if (!keyNode) throw new Error('No key node');
    return keyNode;
  }
  /*
    decrypt the master key or the share key for a property
    Owner or share
  */
   async fetchPropertyKeyAccess(property: string) {
    const authority = this.fetchAuthority();
    if (this.isAuthorityOwner()) {
      const keyOwnerNode = await this.fetchOwnerKeyNode(property);
      return keyOwnerNode;
    }

    const readAccess = await this.read.fetchById(authority.pub);
    if (!readAccess) throw new Error('No read access');

    const propertyAccess = await readAccess.properties.fetchById(property);
    if (!propertyAccess) throw new Error('No property access');

    const keyAccess = await propertyAccess.keys.fetchLast();
    if (!keyAccess) throw new Error('No key access');

    return keyAccess;
  }

  async createReadAccess(pair) {
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