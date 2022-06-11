export const edgeMetadataKey = Symbol("edge");

export async function setupEdges(
  constructor: Function,
  instance: any,
  edgesToFetchFn: () => { getName: string }[] = () => []
) {
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
}

export default function edge(constructorFn: () => { fetch: Function }) {
  return function edge(target: any, propertyKey: string) {
    const constructor = target.constructor || target;
    let metadata = Reflect.getMetadata(edgeMetadataKey, constructor) || {};
    metadata = {
      ...metadata,
      [propertyKey]: constructorFn(),
    };
    Reflect.defineMetadata(edgeMetadataKey, metadata, constructor);
  };
}
