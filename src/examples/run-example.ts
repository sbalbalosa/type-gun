// import './gun-experiments';
// import './create-user';
import Profile from "./profile";
import Post from './post';

const profile = new Profile();
profile.firstName = 'test';
profile.lastName = 'test';
profile.save();

const post = new Post();
post.content = 'test';
post.title = 'title';
post.save();

const testProfile = await Profile.fetch();
const testPost = await testProfile.post.id('l4h1ofp201aEWdwrlxHSJdZ');
const author = await testPost.author.fetch();

console.log(testPost);
console.log(author);


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
