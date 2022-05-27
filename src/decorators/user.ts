// import type { RootNode } from "./types";
import Gun, { IGunInstance } from "gun";
import "reflect-metadata";

import field, { fieldMetadataKey } from "./field";

/*

@user
@root
@set
@fakeset ???
@object
@field
@encrypted
@relation

*/

const gun = Gun([]);

export default function user(gunInstance: IGunInstance<any>) {
  return function (constructor: Function) {
    constructor.nodeType = "user";
    constructor.getParent = function (constructor: Function) {
      // TODO: implement gun fetch in global
      return gunInstance.user();
    };
    constructor.prototype.getNode = function () {
      return constructor.getParent().get(constructor.name.toLowerCase());
    };

    constructor.prototype.save = function () {
      // const encryptedFields = this.getEncryptedFields();
      const fields = Reflect.getMetadata(fieldMetadataKey, constructor);
      const node = fields.reduce((acc, field) => {
        acc[field] = this[field];
        return acc;
      }, {});
      return this.getNode().put(node);
    };
    constructor.prototype.remove = function () {
      return this.getNode().put(null);
    };
  };
}

@user(gun)
class Profile {
  @field
  firstName: string = "";

  @field
  lastName: string = "";

  fullName: string = "";
}

const profile = new Profile();
console.log(profile.save());

/*
@user
class Profile {
  @encrypted email;

  @field username;

  @relation addresses;
  @relation work = Work;
}

saving
const profile = new Profile();
profile.email = 'test@test.com';
profile.username = 'test';
profile.save();


fetching
const profile = await Profile.fetch();

update
const profile = await Profile.fetch();
profile.email = 'newemail@test.com';
profile.save();

observing
Profile.on(() => {
  do something
});

remove
const profile = await Profile.fetch();
profile.remove();

if set
const address = await profile.addresses.fetchById();
const addresses = await profile.addresses.fetchAll();
const profile = await profile.flat();
const profile = await profile.flatParent();
const profile = await profile.flatChildren();

if object
const 

*/
