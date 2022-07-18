import { getSea } from "../helpers";
import link from "./link";
import Keychain from "./lib/keychain";

const sea = getSea();

export default function keychain(constructor: Function) {
  link(constructor, "keychain");

  constructor.prototype.initKeychainDefaults = function() {
    Object.defineProperties(this, {
      'keychain': {
        value: null,
        writable: true
      },
      'userInstance': {
        value: null,
        writable: true
      },
      'hasKeychain': {
        value: true,
        writable: true
      },
      'readKeys': { //TODO: has cache solution
        value: {},
        writable: true
      },
    });
  }

  constructor.prototype.fetchAuthority = function() {
    const fetchAuthority = Keychain.prototype.fetchAuthority.bind({
      userInstance: this.userInstance
    });
    const authority = fetchAuthority();
    if (!authority) throw new Error('No authority set');
    return authority;
  }

  constructor.prototype.attach = async function(keychain) {
    this.initKeychainDefaults();
    if (!keychain.userInstance) throw new Error('keychain has no user instance');
    this.userInstance = keychain.userInstance;
    await this.connect("keychain", keychain.childLink());
    return this;
  }

  constructor.prototype.unlock = async function(userInstance) {
    this.initKeychainDefaults();
    this.userInstance = userInstance;
    await this.query("keychain", Keychain.childQuery);
    return this;
  }

  constructor.prototype.fetchKeychain = async function() {
    const keychain = await this.keychain.fetch();
    if (!keychain) throw new Error('No keychain');
    if (!this.userInstance) throw new Error('No user instance');
    keychain.userInstance = this.userInstance;
    return keychain;
  }

  constructor.prototype.fetchPropertyKey = async function(property: string) {
    const keychain = await this.fetchKeychain();
    // if (this.readKeys[property]) return this.readKeys[property];
    const key = await keychain.fetchPropertyKeyAccess(property);
    if (!key) throw new Error('No property key');
    return key;
    // TODO: cache solution here is buggy create a new branch to solve this
    // this.readKeys[property] = key;
    // return this.readKeys[property];
  }

  constructor.prototype.encryptProperty = async function(property: string, data) {
    const keychain = await this.fetchKeychain();
    const encrypted = await keychain.encryptProperty(property, data);
    return encrypted;
  }

  constructor.prototype.decryptProperty = async function(property: string, data) {
    const keychain = await this.fetchKeychain();
    const decryptedData = await keychain.decryptProperty(property, data);
    return decryptedData;
  }
};