import { reduceFields } from "../helpers";

export const encryptedFieldMetadataKey = Symbol("encrypted");

export function getEncrypteds(constructor) {
  return Reflect.getMetadata(encryptedFieldMetadataKey, constructor) ?? [];
}

export async function createEncryptedData(raw, instance, constructor) {
  if (!instance?.hasKeychain) return raw;
  const fields = getEncrypteds(constructor);
  if (fields.length === 0) return raw;
  return await reduceFields((fields), async (field) => {
    return await instance.encryptProperty(field, raw[field])
  }, {...raw});
}

export async function createDecryptedData(raw, instance, constructor) {
  if (!instance?.hasKeychain) return raw;
  const fields = getEncrypteds(constructor);
  if (fields.length === 0) return raw;
  const keychain = await instance.fetchKeychain();
   return await reduceFields((fields), async (field) => {
    try {
      return await instance.decryptProperty(field, raw[field])
    } catch(error) {
      if (keychain.isAuthorityOwner()) throw error;
      return raw[field];
    }
  }, {...raw});
}

export default function encrypted(target, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = getEncrypteds(constructor);
  metadata.push(propertyKey);
  Reflect.defineMetadata(encryptedFieldMetadataKey, metadata, constructor);
}
