
import { createFieldRawData } from "../field";
import { createEncryptedData } from "../encrypted";

export default function multipleMixin(constructor) {
  constructor.nodeType = 'set';
  constructor.prototype.setId = null;
  constructor.prototype.gunId = null;
  constructor.prototype.parentNode = null;
  constructor.prototype.detached = false;
  

  // TODO: add as a setter
  constructor.prototype.setInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.setId) {
      return this.parentNode.gunInstance().get(this.setId);
    }
    return null;
  }

  constructor.prototype.childInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.gunId) {
      return this.parentNode.gunInstance().get(this.gunId);
    }
    return null;
  }

  // TODO: add as a setter
  constructor.prototype.gunInstance = function() {
    if (this.detached) return this.childInstance();
    if (this.setInstance() && this.gunId) {
      return this.setInstance().get(this.gunId);
    }
    return null;
  }

  constructor.prototype.save = async function() {
    let node = createFieldRawData(this, constructor);
    node = await createEncryptedData(node, this, constructor);
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

  constructor.prototype.remove = async function() {
    if (this.gunId && this.gunInstance() && this.setInstance()) {
      await this.gunInstance().put(null).then();
      this.gunId = null;
      // TODO: clarify why uneset is not working
      // this.setInstance().unset(result);
      return this;
    }
    throw new Error('No gun instance');
  }
}