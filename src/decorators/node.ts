import setupMethods from "./setupMethods";

export default function node(parentFn: () => { getNode: Function }) {
  return function (constructor: Function) {
    constructor.getParent = function () {
      return parentFn().getNode();
    };
    setupMethods(constructor);
  };
}
