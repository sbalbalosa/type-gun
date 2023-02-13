import { GunRecord } from "../types";

export const fieldMetadataKey = Symbol("field");

export function getFields(constructor: Function): string[] {
  return Reflect.getMetadata(fieldMetadataKey, constructor) ?? [];
}

export function hydrateInstance(instance: GunRecord, node: GunRecord) {
  const fields = getFields(instance.constructor);
  fields.forEach((field) => {
    instance[field] = node[field];
  });
  return instance;
}

export function createFieldRawData(instance: GunRecord, constructor: Function) {
  const fields = getFields(constructor);
  const node = fields.reduce((acc, field) => {
    acc[field] = instance[field];
    return acc;
  }, {} as GunRecord);
  return node;
}

export default function field(target: ClassMethodDecoratorContext, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = getFields(constructor);
  metadata.push(propertyKey);
  Reflect.defineMetadata(fieldMetadataKey, metadata, constructor);
}

export function createEmptyData(constructor: Function): GunRecord {
  const fields = getFields(constructor);
  return fields.reduce((acc, field) => {
    acc[field] = null;
    return acc;
  }, {} as GunRecord);
}
