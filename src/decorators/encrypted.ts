
export const encryptedFieldMetadataKey = Symbol("encryptedField");

export function getEncryptedFields(constructor) {
  return Reflect.getMetadata(encryptedFieldMetadataKey, constructor) ?? [];
}

export function hydrateInstance(instance, node) {
  const fields = getEncryptedFields(instance.constructor);
  fields.forEach((field) => {
    instance[field] = node[field]; // TODO - encrypt here
  });
  return instance;
}

export function createEncryptedFieldRawData(instance, constructor) {
  const fields = getEncryptedFields(constructor);
  const node = fields.reduce((acc, field) => {
    acc[field] = instance[field]; // TODO - decrypt here
    return acc;
  }, {});
  return node;
}


export function createEncryptedFieldInstance(constructor, result) {
  const instance = new constructor();
  return hydrateInstance(instance, result);
}

export default function encryptedField(target, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = getEncryptedFields(constructor);
  metadata.push(propertyKey);
  Reflect.defineMetadata(encryptedFieldMetadataKey, metadata, constructor);
}
