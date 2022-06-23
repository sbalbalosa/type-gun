export const edgeMetadataKey = Symbol("edge");

import MultipleQuery from  './query/multiple';
import SingleQuery from './query/single';

export default function edge(constructorFn: () => Function) {
  return function edge(target, propertyKey) {
    const constructor = target.constructor || target;
    let metadata = Reflect.getMetadata(edgeMetadataKey, constructor) || {};
    metadata = {
      ...metadata,
      [propertyKey]: constructorFn(),
    };
    Reflect.defineMetadata(edgeMetadataKey, metadata, constructor);
  };
}

export function setupEdges(
  instance
) {
  const edgeLookup = Reflect.getMetadata(edgeMetadataKey, instance.constructor);
  if (!edgeLookup) return instance; 
  Object.entries(edgeLookup).forEach(([key, edgeConstructor]) => {
    instance[key] = edgeConstructor.isSet ? new MultipleQuery(instance, edgeConstructor) : new SingleQuery(instance, edgeConstructor);
  });

  return instance;
}
