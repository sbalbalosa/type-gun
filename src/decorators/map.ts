
import mapMixin from "./mixins/map";
import linkMixin, { mapLinkMixin }from "./mixins/link";
import { setupEdges } from "./edge";

// TODO: found an issue map is not working if under root

export default function map(constructor: Function) {
  mapMixin(constructor);
  linkMixin(constructor);
  mapLinkMixin(constructor);
  
  constructor.create = function(node, id) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = id;
    instance.mapId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};