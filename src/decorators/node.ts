import setupMethods from "./setupMethods";

export default function node(
  parentFn: () => { getNode: Function; getPath: () => string }
) {
  return function (constructor: Function) {
    constructor.getParentNode = function () {
      return parentFn().getNode();
    };

    constructor.getParentPath = function () {
      return parentFn().getPath();
    };

    setupMethods(constructor);

    constructor.getPath = function () {
      return `${constructor.getParentPath()}/${constructor.getName()}`;
    };
  };
}
