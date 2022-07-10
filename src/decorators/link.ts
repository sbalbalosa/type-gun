export const linkMetadataKey = Symbol("link");


export default function link(target, propertyKey) {
  const constructor = target.constructor || target;
  let metadata = Reflect.getMetadata(linkMetadataKey, constructor) || {};
  metadata = {
    ...metadata,
    [propertyKey]: true,
  };
  Reflect.defineMetadata(linkMetadataKey, metadata, constructor);
};

export function isLinkPropertyExist(constructor, propertyName: string) {
  const linkLookup = Reflect.getMetadata(linkMetadataKey, constructor);
  if (!linkLookup) return false;
  if (linkLookup[propertyName]) return true;
  return false;
}