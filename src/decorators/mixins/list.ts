import { createFieldRawData } from "../field";
import { createEncryptedData } from "../encrypted";

export default function listMixin(constructor) {
  constructor.nodeType = 'list';


  // TODO: looks identical to map and set
  constructor.prototype.initListDefaults = function() {
    Object.defineProperties(this, {
      'listId': {
        value: null,
        writable: true
      },
      'gunId': {
        value: null,
        writable: true
      },
      'parentNode': {
        value: null,
        writable: true
      },
      'detached': {
        value: false,
        writable: true
      }
    });
  }
  
  // TODO: this is repeated on map and set

  // TODO: add as a setter
  constructor.prototype.listInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.listId) {
      return this.parentNode.gunInstance().get(this.listId);
    }
    return null;
  }

  // TODO: this is repeated on map and set

  constructor.prototype.childInstance = function() {
    if (this.parentNode && this.parentNode.gunInstance() && this.gunId) {
      return this.parentNode.gunInstance().get(this.gunId);
    }
    return null;
  }


  // TODO: this is repeated on map and set
  // TODO: add as a setter
  constructor.prototype.gunInstance = function() {
    if (this.detached) return this.childInstance();
    if (this.listInstance() && (this.gunId || this.gunId === 0)) {
      return this.listInstance().get(this.gunId);
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

    const lastIndex = await this.listInstance().get('lastIndex').then();

    if (lastIndex === undefined || lastIndex === null) {
      await this.listInstance().put({
        lastIndex: 0,
        ['0']: node
      });
      this.gunId = 0;
      return this;
    }

    if (this.listInstance()) {
      const newIndex= lastIndex + 1;
      await this.listInstance().put({
        lastIndex: newIndex,
        [`${newIndex}`]: node
      });
      this.gunId = newIndex
      return this;
    }

    throw new Error('Could not save');
    
  }

  // TODO: looks identical to set and map
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