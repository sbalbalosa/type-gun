
import mapMixin from "./mixins/map";
import linkMixin from "./mixins/link";
import MapQuery from "./query/map";
import { setupEdges } from "./edge";

// TODO: found an issue map is not working if under root

export default function map(constructor: Function) {
  mapMixin(constructor);
  linkMixin(constructor);
  
  constructor.create = function(node, id) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = id;
    instance.mapId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }

  constructor.prototype.mapLink = function() {
    if (this.mapInstance()) {
      return {
        gunNode: this.mapInstance(),
        query: (instance, name) => new MapQuery(instance, constructor, name)
      }
    }
    throw new Error('No gun instance');
  }
};