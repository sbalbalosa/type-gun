import { createFieldRawData } from "../field";
import { createEncryptedData } from "../encrypted";

export default function singleMixin(constructor) {
  constructor.nodeType = 'single';

  constructor.prototype.initSingleDefaults = function() {
    Object.defineProperties(this, {
      'gunId': {
        value: null,
        writable: true
      },
      'parentNode': {
        value: null,
        writable: true
      },
    });
  }

  // TODO: add as a setter
  constructor.prototype.gunInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.gunId) {
      return this.parentNode.gunInstance().get(this.gunId);
    }
    return null;
  }
    
  constructor.prototype.save = async function() {
    let node = createFieldRawData(this, constructor);
    node = await createEncryptedData(node, this, constructor);
    if (this.gunInstance()) {
      // TODO: add a check to see if current user could write to this node
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
}