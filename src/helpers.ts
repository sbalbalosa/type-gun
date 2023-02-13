import { IGunChain, IGunUserInstance, IGunOnEvent } from "gun";
import { GlobalMetaData, GunRecord } from "./types";
import Entity from './class/entity';

type Global = GlobalMetaData<typeof globalThis>;

export const getGlobal = function (): Global {
  const global = globalThis as Global;
  global.gun = global.gun ?? null;
  global.sea = global.sea ?? null;
  return global;
};

export const getGun = function () {
  const global = getGlobal();
  if (global.gun) return global.gun;
  throw new Error('Gun instance does not exist');
};

export const getSea = function() {
  const global = getGlobal();
  if (global.sea) return global.sea;
  throw new Error('SEA instance does not exist');
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

export function userCreate(userNode: IGunUserInstance, username: string, password: string) {
  const createPromise = new Promise((resolve, reject) => {
      userNode.create(username, password, (ack) => {
          if ('err' in ack) {
            reject(new Error(ack.err));
          }
          resolve(true);
      });
  });
  return createPromise;
}

export function userAuth(userNode: IGunUserInstance, username: string, password: string) {
  const authPromise = new Promise((resolve, reject) => {
      userNode.auth(username, password, (ack) => {
          if ('err' in ack) reject(new Error(ack.err));
          resolve(true);
      });
  });
  return authPromise;
}


export function userChangePassword(userNode: IGunUserInstance, username: string, password: string, newPassword: string) {
  const authPromise = new Promise((resolve, reject) => {
      userNode.auth(username, password, (ack) => {
          if ('err' in ack) reject(new Error(ack.err));
          resolve(true);
          // TODO: Workaround because change type is 'newPassword' literal.
      }, { change: newPassword as 'newPassword' });
  });
  return authPromise;
}

export async function fetchUser(pub: string) {
  const user = await getGun().user(pub).then();
  return user;
}

export async function reduceFields(fields, valueFetcher, defaultObject = {}) {
    const fieldMap = {};
    const promiseValues = fields.map(async (field, index) => {
       const decryptedValue = await valueFetcher(field);
        fieldMap[index.toString()] = field;
        return decryptedValue;
    });
    const values = await Promise.all(promiseValues);
    
    return values.reduce((acc, value, index) => {
      if (value === null) return acc;
      acc[fieldMap[index.toString()]] = value;
      return acc;
    }, defaultObject);
  }

export async function getRecord(chain: IGunChain<any>): Promise<GunRecord> {
   return new Promise((resolve, reject) => {
            chain.once((record: GunRecord) => {
                if (record) resolve(record);
                reject('No record');
            })
        });
}

export async function putRecord(chain: IGunChain<any>, record: GunRecord | null) {

  return new Promise<void>((resolve, reject) => {
                chain.put(record, (ack) => {
                    if ('err' in ack && ack.err) reject('Internal save failed');
                    resolve();
                })
            });
}

export function subscribeRecord(chain: IGunChain<any>, callback: (record: GunRecord, subscription: IGunOnEvent) => void): void {
      chain.on((record: GunRecord, _key, _msg, event) => {
            callback(record, event);
      });
}

export async function isRecordExist(chain: IGunChain<any>) {
  try { 
    await getRecord(chain);
    return true;
  } catch {
    return false;
  }
}

export async function createPublicRoot(namespace: string): Promise<Entity> {
  const gun = getGun();
  return new Promise((resolve, reject) => {
    gun.get(namespace).put({
      createdAt: Date.now(),
    }, (ack) => {
      if ('err' in ack && ack.err) {
        reject('Cannot create root');
      }
      resolve({
        instance: gun.get(namespace)
      } as unknown as Entity);
    })
  })
}