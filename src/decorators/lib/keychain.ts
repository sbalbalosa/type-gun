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
    #sea: ReturnType<typeof getSea>;

    constructor() {
      const sea = getSea();
      if (!sea) {
        throw new Error('Could not create keychain without SEA');
      }
      this.#sea = sea;
    }

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

        const savePromise = async (field) => {
            const property = Properties.create(this, field);

            await property.sync(); // TODO: check if this is needed.
            const keyCount = await property.keys.length();
            if (keyCount > 0) return;
            property.name = field;
            await property.save();
            const key = Keys.create(property);
            const randomKey = await generateRandomKey();
            key.key = await this.#sea.encrypt(randomKey, authority);
            await key.save();
        };

        for(const field of fields) {
          await savePromise(field);
        }

        return this;
  }

  async regenerateMasterKey(property: string) {
    if (!this.isAuthorityOwner()) throw new Error('Authority not an owner');
    const authority = this.fetchAuthority();
    const propertyNode = await this.properties.fetchById(property);
    if (!propertyNode) throw new Error('No property node');
    let keyNode = await propertyNode.keys.fetchLast();
    if (!keyNode) throw new Error('No key node');
    keyNode = Keys.create(propertyNode);
    const randomKey = await generateRandomKey();
    keyNode.key = await this.#sea.encrypt(randomKey, authority);
    await keyNode.save();

    const readNodesLookup = await this.read?.fetchAll();
    const readNodes = readNodesLookup && Object.values(readNodesLookup);
    if (readNodes && readNodes.length > 0) {
      const savePromises = readNodes.map(async (readNode) => {
        const sharedPropertyNode = await readNode.properties.fetchById(property);
        if (!sharedPropertyNode) return;
        let sharedKeyNode = await sharedPropertyNode.keys.fetchLast();
        if (!sharedKeyNode) return;
        sharedKeyNode = Keys.create(sharedPropertyNode);
        sharedKeyNode.key = await this.#sea.encrypt(randomKey, await this.#sea.secret(readNode.epub, authority));
        await sharedKeyNode.save();
        await sharedKeyNode.connect('master', keyNode.childLink());
      });

      await Promise.all(savePromises);
    }
    

    // const readNode = await this.fetchUpdatedReadKeyNode(); 
    // return keyNode.key;

    // TODO: fetch all read nodes and regenerate their keys
  }

  async grantRead(property: string, pair) {
    if (!pair.pub) throw new Error('No public key'); // TODO: create a helper method to check validity of pair
    const keyNode = await this.fetchUpdatedReadKeyNode(pair, property);
    return !!keyNode;
  }

  async revokeRead(property: string, pair) {
    const keyNode = await this.fetchUpdatedReadKeyNode(pair, property);
    await keyNode.remove();
    await this.regenerateMasterKey(property);
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
  async fetchUpdatedReadKeyNode (pair, property: string) {
    if (!this.isAuthorityOwner()) throw new Error('Authority not an owner');
    const authority = this.fetchAuthority();
    const readAccess = await this.fetchOrCreateReadNode(pair);
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
    const masterKey = await this.#sea.decrypt(ownerKeyAccess.key, authority);
    sharedKeyAccess.key = await this.#sea.encrypt(masterKey, await this.#sea.secret(pair.epub, authority)); // TODO: create a helper method
    await sharedKeyAccess.save();
    await sharedKeyAccess.connect('master', ownerKeyAccess.childLink());
    return sharedKeyAccess;
  }

  async fetchPropertyNode(property: string) {
    const authority = this.fetchAuthority();
    let propertyNode;
    if (this.isAuthorityOwner()) {
      propertyNode = await this.properties?.fetchById(property);
      if (!propertyNode) throw new Error('No property node');
      return propertyNode;
    }
    const readNode = await this.read?.fetchById(authority.pub);
    if (!readNode) throw new Error('No read node');
    propertyNode = await readNode.properties.fetchById(property);
    return propertyNode;
  }


  async fetchOwnerKeyNode(property: string) {
    const propertyNode = await this.properties.fetchById(property);
    if (!propertyNode) throw new Error('No property node');
    const keyNode = await propertyNode.keys.fetchLast();
    if (!keyNode) throw new Error('No key node');
    return keyNode;
  }

  async fetchSharedKeyNode(property: string) {
    const authority = this.fetchAuthority();
    const readAccess = await this.read.fetchById(authority.pub);
    if (!readAccess) throw new Error('No read access');
    const propertyAccess = await readAccess.properties.fetchById(property);
    if (!propertyAccess) throw new Error('No property access');
    const keyAccess = await propertyAccess.keys.fetchLast();
    if (!keyAccess) throw new Error('No key access');
    return keyAccess;
  }
  /*
    decrypt the master key or the share key for a property
    Owner or share
  */
   async fetchPropertyKeyAccess(property: string) {
    if (this.isAuthorityOwner()) {
      const keyOwnerNode = await this.fetchOwnerKeyNode(property);
      return keyOwnerNode;
    }
    return await this.fetchSharedKeyNode(property);
  }

  async encryptProperty(property: string, data) {
    if (!this.isAuthorityOwner()) throw new Error('Authority not owner');
    const authority = this.fetchAuthority();
    const keyNode = await this.fetchOwnerKeyNode(property);
    ;
    const decryptedKey = await this.#sea.decrypt(keyNode.key, authority);
    const result = await this.#sea.encrypt(data, decryptedKey);
    if (!result) throw new Error('Could not encrypt data');
    return result;
  }


  // TODO: refactor create service for owner and shared with same api to avoid if conditions

  async decryptProperty(property: string, data) {
    const propertyNode = await this.fetchPropertyNode(property);
    const keys = await propertyNode.keys.fetchAll();
    const authority = this.fetchAuthority();
    const decryptPromises = keys.map(async (keyNode) => {
      let key;
      let decryptedData
      if (this.isAuthorityOwner()) {
        key = await this.#sea.decrypt(keyNode.key, authority);
        decryptedData = await this.#sea.decrypt(data, key);
      } else {
        if (!this.epub) throw new Error('No owner epub');
        await keyNode.query('master', Keys.childQuery);
        const masterKeyNode = await keyNode.master.fetch();
        
        // TODO check if masterKeyNode is the same with current
        const sharedKey = await this.#sea.decrypt(keyNode.key, await this.#sea.secret(this.epub, authority));
        // key = await sea.decrypt(masterKeyNode.key, sharedKey);
        decryptedData = await this.#sea.decrypt(data, sharedKey);
      }
      if (decryptedData) return decryptedData;
      throw new Error('Could not decrypt data');
    });
    try {
      return await Promise.any(decryptPromises);
    } catch(e) {
      throw e;
    }
  }

  async fetchOrCreateReadNode(pair) {
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