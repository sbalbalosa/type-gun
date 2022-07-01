import { createFieldRawData, hydrateInstance } from "../field";
import { createEncryptedData, createDecryptedData } from "../encrypted";

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

  constructor.prototype.sync = async function() {
    if (this.gunInstance()) {
      let result = await this.gunInstance().then();
      if (result === null) throw new Error('Cannot sync deleted node');
      result = await createDecryptedData(result, this, constructor);
      return hydrateInstance(this, result);
    }
    throw new Error('No gun instance');
  }

  constructor.prototype.subscribe = function() {

  }
}