import singleMixin from "./mixins/single";
import baseMixin from "./mixins/base";
import linkMixin from "./mixins/link";
import { setupEdges } from "./edge";

export default function node(constructor: Function) {
  baseMixin(constructor);
  singleMixin(constructor);
  linkMixin(constructor);

  constructor.create = function(node) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};
