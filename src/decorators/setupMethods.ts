import field, { fieldMetadataKey } from "./field";
import edge, { edgeMetadataKey } from "./edge";

const setupStaticMethods = function (constructor: Function) {
  constructor.getName = function () {
    return constructor.name.toLowerCase();
  };
  constructor.getNode = function () {
    return constructor.getParentNode().get(constructor.getName());
  };
  constructor.fetch = async function (
    edgesToFetchFn: () => { getName: string }[] = () => []
  ) {
    const node = await constructor.getNode().then();

    if (!node) return null;

    const fields = Reflect.getMetadata(fieldMetadataKey, constructor);
    const instance = new constructor();
    fields.forEach((field) => {
      instance[field] = node[field];
    });

    const edgePromises = [];
    const edgeLookup = Reflect.getMetadata(edgeMetadataKey, constructor);
    edgesToFetchFn().forEach((edge) => {
      const edgeName = edge.getName();
      const edgeConstructor = edgeLookup[edgeName];
      const hasRelationship =
        edgeConstructor.getParentPath() === constructor.getPath();
      if (edgeConstructor && hasRelationship) {
        edgePromises.push(
          edgeConstructor.fetch().then((edgeInstance) => ({
            key: edgeName,
            instance: edgeInstance,
          }))
        );
      }
    });

    await Promise.all(edgePromises).then((edgeResults) => {
      edgeResults.forEach((edgeResult) => {
        instance[edgeResult.key] = edgeResult.instance;
      });
    });

    return instance;
  };
};

const setupInstanceMethods = function (constructor: Function) {
  constructor.prototype.save = function () {
    // const encryptedFields = this.getEncryptedFields();
    const fields = Reflect.getMetadata(fieldMetadataKey, constructor);
    const node = fields.reduce((acc, field) => {
      acc[field] = this[field];
      return acc;
    }, {});
    return constructor.getNode().put(node);
  };
  constructor.prototype.remove = function () {
    return constructor.getNode().put(null);
  };
};

const setupMethods = function (constructor: Function) {
  setupStaticMethods(constructor);
  setupInstanceMethods(constructor);
};

export default setupMethods;
