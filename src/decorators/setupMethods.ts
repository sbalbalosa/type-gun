import field, {
  fieldMetadataKey,
  createFieldInstance,
  createFieldRawData,
} from "./field";
import edge, { edgeMetadataKey, setupEdges } from "./edge";

const setupStaticMethods = function (constructor: Function) {
  constructor.getName = function () {
    return constructor.name.toLowerCase();
  };
  constructor.getNode = function () {
    return constructor.getParentNode().get(constructor.getName());
  };
  constructor.fetch = async function () {
    const node = await constructor.getNode().then();
    if (!node) return null;
    const instance = createFieldInstance(constructor, node);
    return await setupEdges(constructor, instance);
  };
};

const setupInstanceMethods = function (constructor: Function) {
  constructor.prototype.save = function () {
    // const encryptedFields = this.getEncryptedFields();
    const node = createFieldRawData(this, constructor);
    return constructor.getNode().put(node);
  };
  constructor.prototype.remove = function () {
    return constructor.getNode().put(null);
  };

  // TODO: get data from gun and sync it with the instance
  constructor.prototype.sync = async function () {
    const node = await constructor.getNode().then();
    if(!node) return;
  };

  // setupEdges(constructor, constructor.prototype);
};

const setupMethods = function (constructor: Function) {
  setupStaticMethods(constructor);
  setupInstanceMethods(constructor);
};

export default setupMethods;
