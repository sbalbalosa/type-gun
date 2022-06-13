import Gun from "cgun";
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

RELATIONSHIP
const post = await Post.fetchById('iasdasfas', () => [Author]);
console.log(post.author);
const collection = await Post.fetchAll(() => [Author]); 

@set
class Post {}

@node(() => Post)
class Author {}
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
      instance.gunId = node?.["_"]?.["#"];
      return instance;
    };

    constructor.fetchAll = async function () {
      const setNode = await constructor.getNode().then();
      let { _, ...rest } = setNode;
      let counter = Object.keys(rest).length - 1;
      const instances = [];
      const fetchPromise = new Promise((resolve) => {
        // QUESTION: Is there a way to not include null in the query?
        constructor
          .getNode()
          .map()
          .once((node, key) => {
            if (rest[key] && node) {
              const instance = createFieldInstance(constructor, node);
              instance.gunId = node["_"]?.["#"];
              instances.push(instance);
            }
            counter--;
            if (counter === 0) resolve(instances);
          });
      });
      return await fetchPromise;
    };

    constructor.prototype.gunId = null;

    constructor.prototype.save = async function () {
      // const encryptedFields = this.getEncryptedFields();
      let gunNode = {};
      const node = createFieldRawData(this, constructor);
      if (this.gunId) {
        gunNode = await constructor.getNode().get(this.gunId).then();
        for (let key in node) {
          gunNode[key] = node[key];
        }
        await constructor.getNode().get(this.gunId).put(gunNode).then();
      } else {
        this.gunId = (await constructor.getNode().set(node).then())?.["_"]?.[
          "#"
        ];
      }
    };

    constructor.prototype.remove = async function () {
      if (this.gunId) {
        // QUESTION: Why is unset not working in this context
        await constructor.getNode().get(this.gunId).put(null).then();
        const gunNode = await constructor.getNode().get(this.gunId).then();
        if (gunNode === null) this.gunNode = null;
      }
    };
  };
}
