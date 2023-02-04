export const fieldMetadataKey = Symbol("field");

export function getFields(constructor) {
  return Reflect.getMetadata(fieldMetadataKey, constructor) ?? [];
}

export function hydrateInstance(instance, node) {
  const fields = getFields(instance.constructor);
  fields.forEach((field) => {
    instance[field] = node[field];
  });
  return instance;
}

export function createFieldRawData(instance, constructor) {
  const fields = getFields(constructor);
  const node = fields.reduce((acc, field) => {
    acc[field] = instance[field];
    return acc;
  }, {});
  return node;
}

export default function field(target, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = getFields(constructor);
  metadata.push(propertyKey);
  Reflect.defineMetadata(fieldMetadataKey, metadata, constructor);
}
