export const relationMetadataKey = Symbol("relation");

export default function relation(target: any, propertyKey: string) {
  const constructor = target.constructor || target;
  const metadata = Reflect.getMetadata(relationMetadataKey, constructor) || [];
  metadata.push(propertyKey);
  Reflect.defineMetadata(relationMetadataKey, metadata, constructor);
}
