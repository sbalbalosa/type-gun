
import mapMixin from "./mixins/map";
import { setupEdges } from "./edge";

export default function map(constructor: Function) {
  mapMixin(constructor);
  
  constructor.create = function(node, id) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = id;
    instance.mapId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};