// import type { RootNode } from "./types";
import Gun, { IGunInstance } from "gun";
import "gun/lib/then.js";
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

const setupStaticMethods = function (constructor: Function) {
  constructor.getNode = function () {
    return constructor.getParent().get(constructor.name.toLowerCase());
  };
  constructor.fetch = async function () {
    const node = await constructor.getNode().then();

    if (!node) return null;

    const fields = Reflect.getMetadata(fieldMetadataKey, constructor);
    const instance = new constructor();
    fields.forEach((field) => {
      instance[field] = node[field];
    });

    return instance;
  };
};

const setupInstanceMethods = function (constructor: Function) {
  constructor.prototype.save = function () {
    // const encryptedFields = this.getEncryptedFields();
    const fields = Reflect.getMetadata(fieldMetadataKey, constructor);
    const node = fields.reduce((acc, field) => {
      acc[field] = this[field];
      return acc;
    }, {});
    return constructor.getNode().put(node);
  };
  constructor.prototype.remove = function () {
    return constructor.getNode().put(null);
  };
};

const setupMethods = function (constructor: Function) {
  setupStaticMethods(constructor);
  setupInstanceMethods(constructor);
};

const gun = Gun([]);

export default function root(gunInstance: IGunInstance<any>) {
  return function (constructor: Function) {
    constructor.getParent = function () {
      return gunInstance.get("root");
    };
    setupMethods(constructor);
  };
}

function node(parent: { getNode: Function }) {
  return function (constructor: Function) {
    constructor.getParent = function () {
      return parent.getNode();
    };
    setupMethods(constructor);
  };
}

@root(gun)
class Profile {
  @field
  firstName: string = "test";

  @field
  lastName: string = "test1";

  fullName: string = "";
}

@node(Profile)
class Degree {
  @field
  title: string = "title";
}

@node(Degree)
class University {
  @field
  name: string = "DLSU-D";
}

// const profile = new Profile();

let profile = new Profile();
profile.firstName = "test2";
profile.save();
console.log(profile);
// profile.remove();
// profile = await Profile.fetch();
// console.log(profile);

const degree = new Degree();
degree.title = "new degree";
degree.save();

const university = new University();
university.name = "DLSU";
university.save();

profile.degree
