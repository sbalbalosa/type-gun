
import mapMixin from "./mixins/map";
import baseMixin from "./mixins/base";
import linkMixin, { mapLinkMixin }from "./mixins/link";
import { setupEdges } from "./edge";

// TODO: found an issue map is not working if under root

export default function map(constructor: Function) {
  baseMixin(constructor);
  mapMixin(constructor);
  linkMixin(constructor);
  mapLinkMixin(constructor);
  
  constructor.create = function(node, id) {
    const instance = new constructor();
    instance.initMapDefaults();
    instance.parentNode = node;
    instance.gunId = id;
    instance.mapId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};