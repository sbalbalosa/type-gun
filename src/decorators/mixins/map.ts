import { createFieldRawData } from "../field";
import { createEncryptedData } from "../encrypted";

export default function mapMixin(constructor) {
  constructor.nodeType = 'map';
  constructor.prototype.mapId = null;
  constructor.prototype.gunId = null;
  constructor.prototype.parentNode = null;
  constructor.prototype.detached = false;
  

  // TODO: add as a setter
  constructor.prototype.mapInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.mapId) {
      return this.parentNode.gunInstance().get(this.mapId);
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
    if (this.mapInstance() && this.gunId) {
      return this.mapInstance().get(this.gunId);
    }
    return null;
  }

  constructor.prototype.save = async function() {
    let node = createFieldRawData(this, constructor);
    node = await createEncryptedData(node, this, constructor);
    if (this.gunId && this.gunInstance()) {
      await this.gunInstance().put(node).then();
      return this;
    }
    throw new Error('No gun instance');
  }

  constructor.prototype.remove = async function() {
    if (this.gunId && this.gunInstance()) {
      await this.gunInstance().put(null).then();
      this.gunId = null;
      // TODO: clarify why uneset is not working
      // this.setInstance().unset(result);
      return this;
    }
    throw new Error('No gun instance');
  }
}