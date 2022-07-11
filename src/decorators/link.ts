export const linkMetadataKey = Symbol("link");


export default function link(constructor, propertyKey) {
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
