import multipleMixin from "./mixins/multiple";
import baseMixin from "./mixins/base";
import linkMixin, { setLinkMixin } from "./mixins/link";
import { setupEdges } from "./edge";

export default function set(constructor: Function) {
  baseMixin(constructor);
  multipleMixin(constructor);
  linkMixin(constructor);
  setLinkMixin(constructor);
  
  constructor.create = function(node) {
    const instance = new constructor();
    instance.initSetDefaults();
    instance.parentNode = node;
    instance.gunId = null;
    instance.setId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};