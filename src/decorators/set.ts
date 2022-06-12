import Gun from "gun";
import { createFieldInstance, createFieldRawData } from "./field";
import setupMethods from "./setupMethods";

/*
FETCHING
const post = await Post.fetchById('iasdasfas');
const collection = await Post.fetchAll(); // returns a collection of posts

SAVING
const post = new Post();
post.title = "Hello World";
post.content = 'test';
await post.save();

BATCH SAVING
const posts = await Post.saveAll(posts);

REMOVING
await Post.removeById("1uhbygbnuhgbn");
await Post.remove(post);
*/

export default function set(
  parentFn: () => { getNode: Function; getPath: () => string }
) {
  return function (constructor: Function) {
    constructor.getName = function () {
      return constructor.name.toLowerCase();
    };

    constructor.getParentNode = function () {
      return parentFn().getNode();
    };

    constructor.getParentPath = function () {
      return parentFn().getPath();
    };

    constructor.getNode = function () {
      return constructor.getParentNode().get(constructor.getName());
    };

    constructor.fetchById = async function (id: string) {
      const node = await constructor.getNode().get(id).then();
      if (!node) return null;
      const instance = createFieldInstance(constructor, node);
      instance.shell = node;
      return instance;
    }

    constructor.fetchAll = async function () {

      const setNode = await constructor.getNode().then();

      // find all keys of setNode

      // const fetchPromise = new Promise((resolve, reject) => {

      //   constructor.getNode().map().once((nodes: any) => {

      //   }))
      // })

    }

    constructor.prototype.shell = Gun.node.ify({});

    constructor.prototype.save = function () {
      // const encryptedFields = this.getEncryptedFields();
      const node = createFieldRawData(this, constructor);

      return constructor.getNode().set({
        ...constructor.prototype.shell,
        ...node
      });
    };

    constructor.prototype.remove = function () {
      return constructor.getNode().unset(constructor.prototype.shell);
    };
  };
}
