import listMixin from "./mixins/list";
import baseMixin from "./mixins/base";
import linkMixin, { listLinkMixin }from "./mixins/link";
import { setupEdges } from "./edge";

// TODO: found an issue map is not working if under root

export default function list(constructor: Function) {
  baseMixin(constructor);
  listMixin(constructor);
  linkMixin(constructor);
  listLinkMixin(constructor);
  
  constructor.create = function(node, id: number | null = null) {
    const instance = new constructor();
    instance.initListDefaults();
    instance.parentNode = node;
    instance.gunId = id;
    instance.listId = constructor.name.toLowerCase();
    return setupEdges(instance);
  }
};