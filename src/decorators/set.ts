import multipleMixin from "./mixins/multiple";
import { setupEdges } from "./edge";

export default function set(constructor: Function) {
  multipleMixin(constructor);
  
  constructor.create = function(node) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = null;
    instance.setId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};