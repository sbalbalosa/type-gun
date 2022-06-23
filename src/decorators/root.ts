import { IGunInstance } from "gun";
import singleMixin from "./singleMixin";
import { setupEdges } from "./edge";

export default function root(constructor: Function) {
  singleMixin(constructor);

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
