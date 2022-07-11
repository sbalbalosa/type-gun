import { getSea } from "../helpers";
import link from "./link";
import Keychain from "./lib/keychain";

const sea = getSea();

export default function keychain(constructor: Function) {
  constructor.prototype.keychain = null;
  constructor.prototype.userInstance = null;
  constructor.prototype.hasKeychain = true;
  constructor.prototype.readKeys = {}; // TODO: create a cache solution

  link(constructor, "keychain");

  constructor.prototype.fetchAuthority = function() {
    const fetchAuthority = Keychain.prototype.fetchAuthority.bind({
      userInstance: this.userInstance
    });
    const authority = fetchAuthority();
    if (!authority) throw new Error('No authority set');
    return authority;
  }

  constructor.prototype.attachKeychain = async function(keychain) {
    if (!keychain.userInstance) throw new Error('keychain has no user instance');
    this.userInstance = keychain.userInstance;
    await this.connect("keychain", keychain.childLink());
  }

  constructor.prototype.initKeychain = async function(userInstance) {
    this.userInstance = userInstance;
    await this.query("keychain", Keychain.childQuery);
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
    // TODO: check why commented code is shared between instance
    // if (this.readKeys[property]) return this.readKeys[property];
    const key = await keychain.fetchPropertyKey(property);
    if (!key) throw new Error('No property key');
    return key;
    // this.readKeys[property] = key;
    // return this.readKeys[property];
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
};