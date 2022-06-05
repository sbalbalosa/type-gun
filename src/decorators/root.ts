import { IGunInstance } from "gun";

import setupMethods from "./setupMethods";

export default function root(gunInstance: IGunInstance<any>) {
  return function (constructor: Function) {
    constructor.getParent = function () {
      return gunInstance.get("root");
    };
    setupMethods(constructor);
  };
}
