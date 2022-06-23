import './gun-experiments';
// import './create-user';

import { getGun } from "../helpers";

import Profile from "./profile";
import Degree from './degree';
import Authors from './authors';
import Posts from './posts';

const profile = Profile.create(getGun());
// const degree = Degree.create(profile);
// degree.title = 'BSIT';
// await degree.save();

const posts = await profile.posts.fetchAll();
const degree = await profile.degree.fetch();
const author = Authors.create(degree);
author.name = 'Black mamba!';
await author.save();

console.log(posts);
console.log(degree);

const posts1 = await degree.parentNode.posts.fetchAll();
console.log(posts1);

const author1 = (await (await profile.degree.fetch()).author.fetch());
console.log(author1);

// posts[1].title = 'This is updated!!';
// await posts[1].save();

// const posts1 = await profile.posts.fetchAll();
// console.log(posts1);

// const post = await profile.posts.fetchById('l4r0g5hbm6v8ptwtR39E');
// post.title = "Amazing!!";
// await post.save();
// console.log(post);

// const degree = Degree.create(profile);
// degree.title = 'test';
// await degree.save();

// const post = Posts.create(profile);
// post.title = 'this is a post';
// post.content = 'content';
// await post.save();

// const post1 = Posts.create(profile);
// post1.title = 'this is a post';
// post1.content = 'content';
// await post1.save();

// const post2 = Posts.create(profile);
// post2.title = 'this is a post';
// post2.content = 'content';
// await post2.save();
// const author = Authors.create(post);
// author.name = 'John';
// await author.save();

// const degree2 = Degree.create(author);
// degree2.title = 'yup';
// await degree2.save();




// import Degree from "./degree";
// import University from "./university";

// const profile = new Profile();
// profile.firstName = "John";
// profile.lastName = "Doe";
// profile.save();

// const degree = new Degree();
// degree.title = "Information Technology";
// degree.save();

// const updatedProfile = await Profile.fetch(() => [Degree]);
// console.log(updatedProfile.degree);
// console.log(updatedProfile);

// const university = new University();
// university.name = "DLSU-D-test";
// university.save();

// const profileWithUniversity = await University.fetch(() => [Profile]);
// console.log(profileWithUniversity.profile);

// const post1 = new Post();
// post1.content = "content1";
// post1.title = "title1";
// await post1.save();

// const post2 = new Post();
// post2.content = "content2";
// post2.title = "title2";
// await post2.save();

// console.log("-------");

// const posts = await Post.fetchAll();
// console.log(posts);

// post1.content = "updated-content1";
// post1.title = "updated-title1";
// await post1.save();

// post2.content = "updated-content2";
// post2.title = "updated-title2";
// await post2.save();

// const test = await Post.fetchAll();

// console.log(test);

// await post1.remove();
// await post2.remove();

// const test2 = await Post.fetchAll();

// console.log(test2);


// const author = post1.author.fetch();
// const post = new Post();
// await post.fetchById();
// await post.author.fetch();
