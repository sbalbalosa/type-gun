export const edgeMetadataKey = Symbol("edge");

import SetQuery from  './query/set';
import SingleQuery from './query/single';
import MapQuery from './query/map';
import ListQuery from './query/list';

const queryMap = {
  'set': SetQuery,
  'map': MapQuery,
  'single': SingleQuery,
  'list': ListQuery
}

export default function edge(constructorFn: () => Function) {
  return function edge(target, propertyKey) {
    const constructor = target.constructor || target;
    let metadata = Reflect.getMetadata(edgeMetadataKey, constructor) || {};
    metadata = {
      ...metadata,
      [propertyKey]: constructorFn,
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
    const constructor = edgeConstructor();
    const query = queryMap[constructor.nodeType];
    instance[key] = new query(instance, constructor);
  });

  return instance;
}
