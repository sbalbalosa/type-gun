import singleMixin from "./mixins/single";
import { setupEdges } from "./edge";

export default function node(constructor: Function) {
  singleMixin(constructor);

  constructor.create = function(node) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};
