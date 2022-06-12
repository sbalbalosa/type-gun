export const fieldMetadataKey = Symbol("field");

export function createFieldRawData(instance: any, constructor: any) {
  const fields = Reflect.getMetadata(fieldMetadataKey, constructor);
  const node = fields.reduce((acc, field) => {
    acc[field] = instance[field];
    return acc;
  }, {});
  return node;
}

export function createFieldInstance(constructor: any, node: any) {
  const fields = Reflect.getMetadata(fieldMetadataKey, constructor);
  const instance = new constructor();
  fields.forEach((field) => {
    instance[field] = node[field];
  });
  return instance;
}

export default function field(target: any, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = Reflect.getMetadata(fieldMetadataKey, constructor) || [];
  metadata.push(propertyKey);
  Reflect.defineMetadata(fieldMetadataKey, metadata, constructor);
}
