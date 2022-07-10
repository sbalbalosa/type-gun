import { IGunInstance } from "gun";
import singleMixin from "./mixins/single";
import baseMixin from "./mixins/base";
import linkMixin from "./mixins/link";
import { setupEdges } from "./edge";

export default function root(constructor: Function) {
  baseMixin(constructor);
  singleMixin(constructor);
  linkMixin(constructor);

  constructor.create = function(gunInstance: IGunInstance<any>, name = 'root') {
    const instance = new constructor();
    instance.gunId = constructor.name.toLowerCase();
    instance.parentNode = {
      gunInstance: () => gunInstance.get(name),
      gunPath: () =>  name
    };
    return setupEdges(instance);
  }
};
