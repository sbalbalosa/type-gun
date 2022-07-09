import multipleMixin from "./mixins/multiple";
import linkMixin from "./mixins/link";
import SetQuery from "./query/set";
import { setupEdges } from "./edge";

export default function set(constructor: Function) {
  multipleMixin(constructor);
  linkMixin(constructor);
  
  constructor.create = function(node) {
    const instance = new constructor();
    instance.parentNode = node;
    instance.gunId = null;
    instance.setId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }

   constructor.prototype.setLink = function() {
    if (this.setInstance()) {
      return {
        gunNode: this.setInstance(),
        query: (instance, name) => new SetQuery(instance, constructor, name)
      }
    }
    throw new Error('No gun instance');
  }
};