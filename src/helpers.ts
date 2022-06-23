export const getGlobal = function () {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
};

export const getGun = function () {
  const global = getGlobal();
  return global.typeGunInstance;
};

export const removeProperty = (obj, id) => {
  const { [id]: _, ...rest } = obj;
  return rest;
}