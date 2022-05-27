export const fieldMetadataKey = Symbol("field");

export default function field(target: any, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = Reflect.getMetadata(fieldMetadataKey, constructor) || [];
  metadata.push(propertyKey);
  Reflect.defineMetadata(fieldMetadataKey, metadata, constructor);
}
