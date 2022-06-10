import { IGunInstance } from "gun";

import setupMethods from "./setupMethods";

export default function root(
  gunInstance: IGunInstance<any>,
  name: string = "root"
) {
  return function (constructor: Function) {
    constructor.getParentNode = function () {
      return gunInstance.get(name);
    };

    constructor.getParentPath = function () {
      return name;
    };

    setupMethods(constructor);

    constructor.getPath = function () {
      return `${name}/${constructor.getName()}`;
    };
  };
}
