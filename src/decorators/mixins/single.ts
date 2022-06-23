import { createFieldRawData, hydrateInstance } from "../field";

export default function singleMixin(constructor) {
  constructor.isSet = false;
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
    const node = createFieldRawData(this, constructor);
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
      const result = await this.gunInstance().then();
      if (result === null) throw new Error('Cannot sync deleted node');
      return hydrateInstance(this, result);
    }
    throw new Error('No gun instance');
  }

  constructor.prototype.subscribe = function() {

  }
}