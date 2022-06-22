export const edgeMetadataKey = Symbol("edge");

export function setupEdges(
  constructor: Function,
  instance: any,
) {
  const edgeLookup = Reflect.getMetadata(edgeMetadataKey, constructor);
  if (!edgeLookup) return instance; 
  Object.entries(edgeLookup).forEach(([key, edgeConstructor]) => {
    if (edgeConstructor.getParentPath() === constructor.getPath()) {
      instance[key] = edgeConstructor;
    }
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
