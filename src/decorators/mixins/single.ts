import { createFieldRawData, hydrateInstance } from "../field";
import { createEncryptedData, createDecryptedData } from "../encrypted";
import { isLinkPropertyExist } from "../link";

import SingleQuery from "../query/single";

export default function singleMixin(constructor) {
  constructor.nodeType = 'single';
  constructor.prototype.gunId = null;
  constructor.prototype.parentNode = null;
  

  // TODO: add as a setter
  constructor.prototype.gunInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.gunId) {
      return this.parentNode.gunInstance().get(this.gunId);
    }
    return null;
  }
    
  // TODO: add as a setter
  constructor.prototype.gunPath = function() {
    if (this.parentNode && this.gunId) {
      return `${this.parentNode.gunPath()}/${this.gunId}`;
    }
    return null;
  }

  constructor.prototype.save = async function() {
    let node = createFieldRawData(this, constructor);
    node = await createEncryptedData(node, this, constructor);
    if (this.gunInstance()) {
      await this.gunInstance().put(node).then();
      return this;
    }
    throw new Error('No gun instance');
  }
  
  constructor.prototype.remove = async function() { 
    if (this.gunInstance()) {
      await this.gunInstance().put(null).then();
      return this;
    }
    throw new Error('No gun instance');
  }

  constructor.prototype.raw = async function() {
    if (this.gunInstance()) {
      let result = await this.gunInstance().then();
      if (result === null) throw new Error('Node is deleted');
      return result;
    };
    throw new Error('No gun instance');
  }

  constructor.prototype.subscribe = function() {

  }

  // TODO: create a type for link object
  constructor.prototype.link = function() {
    if (this.gunInstance()) {
      return {
        gunNode: this.gunInstance(),
        query: (instance) => new SingleQuery(instance, constructor)
      }
    }
    throw new Error('No gun instance');
  }

  constructor.prototype.connect = async function(propertyName: string, link) {
    if (!isLinkPropertyExist(constructor, propertyName)) throw new Error('No link property found');

    const node = await link.gunNode.then();
    if (!node) throw new Error('No gun node');
    await this.gunInstance().get(propertyName).put(node).then();
    const query = link.query(this);
    this[propertyName] = query;
  }
}