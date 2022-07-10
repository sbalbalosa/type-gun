import SingleQuery from "../query/single";
import { isLinkPropertyExist } from "../link";
import MapQuery from "../query/map";
import SetQuery from "../query/set";

export default function linkMixin(constructor) {
  // TODO: create a type for link object
  constructor.prototype.link = function() {
    if (this.gunInstance()) {
      return {
        gunNode: this.gunInstance(),
        query: (instance, name) => new SingleQuery(instance, constructor, name)
      }
    }
    throw new Error('No gun instance');
  }

  constructor.prototype.connect = async function(propertyName: string, link) {
    if (!isLinkPropertyExist(constructor, propertyName)) throw new Error('No link property found');

    const node = await link.gunNode.then();
    if (!node) throw new Error('No gun node');
    await this.gunInstance().get(propertyName).put(node).then();
    const query = link.query(this, propertyName);
    this[propertyName] = query;
  }
}

export function mapLinkMixin(constructor) {
  constructor.prototype.mapLink = function() {
      if (this.mapInstance()) {
        return {
          gunNode: this.mapInstance(),
          query: (instance, name) => new MapQuery(instance, constructor, name)
        }
      }
      throw new Error('No gun instance');
    }
}

export function setLinkMixin(constructor) {
  constructor.prototype.setLink = function() {
    if (this.setInstance()) {
      return {
        gunNode: this.setInstance(),
        query: (instance, name) => new SetQuery(instance, constructor, name)
      }
    }
    throw new Error('No gun instance');
  }
}
