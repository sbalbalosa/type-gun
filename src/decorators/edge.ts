export const edgeMetadataKey = Symbol("edge");

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
