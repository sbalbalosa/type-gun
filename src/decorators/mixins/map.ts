import { createFieldRawData } from "../field";
import { createEncryptedData } from "../encrypted";

export default function mapMixin(constructor) {
  constructor.nodeType = 'map';
  constructor.prototype.mapId = null;
  constructor.prototype.gunId = null;
  constructor.prototype.parentNode = null;
  

  // TODO: add as a setter
  constructor.prototype.mapInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.mapId) {
      return this.parentNode.gunInstance().get(this.mapId);
    }
    return null;
  }


  // TODO: add as a setter
  constructor.prototype.gunInstance = function() {
    if (this.mapInstance() && this.gunId) {
      return this.mapInstance().get(this.gunId);
    }
    return null;
  }
    
  // TODO: add as a setter
  constructor.prototype.gunPath = function() {
    if (this.parentNode && this.gunId && this.mapId) {
      return `${this.parentNode.gunPath()}/${this.mapId}/${this.gunId}`;
    }
    return null;
  }

  constructor.prototype.save = async function() {
    let node = createFieldRawData(this, constructor);
    node = createEncryptedData(node, constructor);
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