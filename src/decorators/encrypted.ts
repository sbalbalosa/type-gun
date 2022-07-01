
export const encryptedFieldMetadataKey = Symbol("encrypted");

export function getEncrypteds(constructor) {
  return Reflect.getMetadata(encryptedFieldMetadataKey, constructor) ?? [];
}

export async function createEncryptedData(raw, instance, constructor) {
  const fields = getEncrypteds(constructor);
  if (fields.length === 0) return raw;

  const node = await fields.reduce(async (accP, field) => {
    const acc = await accP;
    if (raw[field]) {
      acc[field] = await instance.encryptProperty(field, raw[field]); // TODO: encrypt data
    }
    return acc;
  }, Promise.resolve(raw));
  return node;
}

export async function createDecryptedData(raw, instance, constructor) {
  const fields = getEncrypteds(constructor);
  if (fields.length === 0) return raw;

  const node = await fields.reduce(async (accP, field) => {
    const acc = await accP;
    if (raw[field]) {
      acc[field] = await instance.decryptProperty(field, raw[field]); // TODO: encrypt data
    }
    return acc;
  }, Promise.resolve(raw));
  return node;
}

export default function encrypted(target, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = getEncrypteds(constructor);
  metadata.push(propertyKey);
  Reflect.defineMetadata(encryptedFieldMetadataKey, metadata, constructor);
}
