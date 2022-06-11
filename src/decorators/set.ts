import setupMethods from "./setupMethods";

/*
FETCHING
const post = await Posts.fetchById('iasdasfas');
const collection = Posts.fetchAll();

SAVING
const post = Posts.create();
post.title = "Hello World";
post.content = 'test';
await post.save();

BATCH SAVING
const posts = await Posts.saveAll(posts);

REMOVING
await Posts.removeById("1uhbygbnuhgbn");
await Posts.remove(post);
*/

export default function set(
  parentFn: () => { getNode: Function; getPath: () => string }
) {
  return function (constructor: Function) {
    constructor.getParentNode = function () {
      return parentFn().getNode();
    };

    constructor.getParentPath = function () {
      return parentFn().getPath();
    };

    setupMethods(constructor);

    constructor.getPath = function () {
      return `${constructor.getParentPath()}/${constructor.getName()}`;
    };
  };
}
