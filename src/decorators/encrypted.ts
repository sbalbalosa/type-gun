
export const encryptedFieldMetadataKey = Symbol("encrypted");

export function getEncrypteds(constructor) {
  return Reflect.getMetadata(encryptedFieldMetadataKey, constructor) ?? [];
}

export function createEncryptedData(raw, constructor) {
  // const fields = getEncrypteds(constructor);
  // const node = fields.reduce((acc, field) => {
  //   acc[field] = raw[field]; // TODO: encrypt data
  //   return acc;
  // }, {});
  // return node;
  return raw;
}

export function createDecryptedData(raw, constructor) {
  // const fields = getEncrypteds(constructor);
  // const node = fields.reduce((acc, field) => {
  //   acc[field] = raw[field]; // TODO: decrypt data
  //   return acc;
  // }, {});
  // return node;
  return raw;
}

export default function encrypted(target, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = getEncrypteds(constructor);
  metadata.push(propertyKey);
  Reflect.defineMetadata(encryptedFieldMetadataKey, metadata, constructor);
}
