import singleMixin from "./singleMixin";
import { createFieldRawData } from "./field";

export default function set(constructor: Function) {
  singleMixin(constructor);

  constructor.create = function(node) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = null;
    instance.setId = constructor.name.toLowerCase();
    return instance;
  }

  constructor.prototype.setId = null;

  // TODO: add as a setter
  constructor.prototype.setInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.setId) {
      return this.parentNode.gunInstance().get(this.setId);
    }
    return null;
  }


  // TODO: add as a setter
  constructor.prototype.gunInstance = function() {
    if (this.setInstance() && this.gunId) {
      return this.setInstance().get(this.gunId);
    }
    return null;
  }
    
  // TODO: add as a setter
  constructor.prototype.gunPath = function() {
    if (this.parentNode && this.gunId && this.setId) {
      return `${this.parentNode.gunPath()}/${this.setId}/${this.gunId}`;
    }
    return null;
  }

  constructor.prototype.save = async function() {
    const node = createFieldRawData(this, constructor);
    if (this.gunId && this.gunInstance()) {
      await this.gunInstance().put(node).then();
      return this;
    } else if (this.setInstance()) {
      const result = await this.setInstance().set(node).then();
      this.gunId = result?.['_']?.['#'];
      return this;
    }
    throw new Error('No gun instance');
  }
};