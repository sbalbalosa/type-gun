import SingleQuery from "../query/single";
import { isLinkPropertyExist } from "../link";
import MapQuery from "../query/map";
import SetQuery from "../query/set";
import ChildQuery from "../query/child";

export default function linkMixin(constructor) {
  // TODO: create a type for link object
  
  constructor.query = (instance, name) => new SingleQuery(instance, constructor, name);
  constructor.prototype.link = function() {
    if (this.gunInstance()) {
      return {
        gunNode: this.gunInstance(),
        query: constructor.query,
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

  constructor.prototype.query = async function(propertyName: string, query) {
    if (!isLinkPropertyExist(constructor, propertyName)) throw new Error('No link property found');
    this[propertyName] = query(this, propertyName);
  }
}

export function childLinkMixin(constructor) {
  constructor.childQuery = (instance, name) => new ChildQuery(instance, constructor, name);
  constructor.prototype.childLink = function() {
    if (this.gunInstance()) {
      return {
        gunNode: this.gunInstance(),
        query: constructor.childQuery,
      }
    }
    throw new Error('No gun instance');
  }
}

// TODO: mapLinkMixin and setLinkMixin looks the same

export function mapLinkMixin(constructor) {
  childLinkMixin(constructor);
  constructor.mapQuery = (instance, name) => new MapQuery(instance, constructor, name);
  constructor.prototype.mapLink = function() {
      if (this.mapInstance()) {
        return {
          gunNode: this.mapInstance(),
          query: constructor.mapQuery
        }
      }
      throw new Error('No gun instance');
    }
}

export function setLinkMixin(constructor) {
  childLinkMixin(constructor);

  constructor.setQuery = (instance, name) => new SetQuery(instance, constructor, name);
  constructor.prototype.setLink = function() {
    if (this.setInstance()) {
      return {
        gunNode: this.setInstance(),
        query: constructor.setQuery
      }
    }
    throw new Error('No gun instance');
  }
}

export function listLinkMixin(constructor) {
  childLinkMixin(constructor);

  constructor.listQuery = (instance, name) => new SetQuery(instance, constructor, name);
  constructor.prototype.listLink = function() {
    if (this.listInstance()) {
      return {
        gunNode: this.listInstance(),
        query: constructor.listQuery
      }
    }
    throw new Error('No gun instance');
  }
}