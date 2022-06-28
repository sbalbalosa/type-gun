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

export const getSea = function() {
  return getGun().SEA;
}

export const generateRandomKey = async function() {
  const sea = getSea();
  const randomPair = await sea.pair();
  return randomPair.priv;
}

export const removeProperty = (obj, id) => {
  const { [id]: _, ...rest } = obj;
  return rest;
}

export function userCreate(userNode, username, password) {
  const createPromise = new Promise((resolve, reject) => {
      userNode.create(username, password, (ack) => {
          if (ack.err) reject(new Error(ack.err));
          resolve(true);
      });
  });
  return createPromise;
}

export function userAuth(userNode, username, password) {
  const authPromise = new Promise((resolve, reject) => {
      userNode.auth(username, password, (ack) => {
          if (ack.err) reject(new Error(ack.err));
          resolve(true);
      });
  });
  return authPromise;
}


export function userChangePassword(userNode, username, password, newPassword) {
  const authPromise = new Promise((resolve, reject) => {
      userNode.auth(username, password, (ack) => {
          if (ack.err) reject(new Error(ack.err));
          resolve(true);
      }, { change: newPassword });
  });
  return authPromise;
}

export async function fetchUser(pub: string) {
  const user = await getGun().user(pub).then();
  return user;
}