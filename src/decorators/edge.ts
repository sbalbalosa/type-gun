export const edgeMetadataKey = Symbol("edge");

import SetQuery from  './query/set';
import SingleQuery from './query/single';
import MapQuery from './query/map';

const queryMap = {
  'set': SetQuery,
  'map': MapQuery,
  'single': SingleQuery
}

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
    const query = queryMap[edgeConstructor.nodeType];
    instance[key] = new query(instance, edgeConstructor);
  });

  return instance;
}
