import User from '../authentication/user';
import Profile from './profile';
import Posts from './posts';

const user = await User.create('testing', 'testing1234');

const post = Posts.create(user);
post.title = 'New title';
post.content = 'New content';
await post.save();

const post1 = Posts.create(user);
post1.title = 'Another one';
post1.content = 'Another content';
await post1.save();


const profile = Profile.create(user);
user.firstName = 'John';
user.lastName = 'Doe';
await profile.save();

const post2 = Posts.create(profile);
post2.title = 'Wait';
post2.content = 'CCCCC';
await post2.save();

// import './gun-experiments';
// import testUser from './create-user';
// import Profile from "./profile";


// const user = await testUser();

// const profile = Profile.create(user);
// profile.firstName = 'Save to user';
// profile.save();

// profile.save();