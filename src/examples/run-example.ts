// import User from '../authentication/user';
// import Profile from './profile';
// import Posts from './posts';

// const user = await User.create('testing', 'testing1234');

// const post = Posts.create(user);
// post.title = 'New title';
// post.content = 'New content';
// await post.save();

// const post1 = Posts.create(user);
// post1.title = 'Another one';
// post1.content = 'Another content';
// await post1.save();


// const profile = Profile.create(user);
// user.firstName = 'John';
// user.lastName = 'Doe';
// await profile.save();

// const post2 = Posts.create(profile);
// post2.title = 'Wait';
// post2.content = 'CCCCC';
// await post2.save();

// import './gun-experiments';
// import testUser from './create-user';
// import Profile from "./profile";


// const user = await testUser();

// const profile = Profile.create(user);
// profile.firstName = 'Save to user';
// profile.save();

// profile.save();
import Organization from "./organization";
import Keychain from "../decorators/lib/keychain";
import Read from "../decorators/lib/read";
import Properties from "../decorators/lib/properties";
import Keys from "../decorators/lib/keys";
import { getGun } from "../helpers";


const user = await testUser();

const organization = Organization.create(user);
organization.name = "test";
await organization.save();

const keyChain = Keychain.create(organization);
keyChain.owner = "ownerid";
await keyChain.save();

const keys = Keys.create(keyChain, 'address');
keys.key = "addess-key";
keys.generatedAt = "323423523532523";
await keys.save();

const readAccess = Read.create(keyChain, 'pubid1');
readAccess.pub = 'pubid1';
await readAccess.save();

const property = Properties.create(readAccess, 'address');
property.key = 'asdasqwrsdaseaseqwe';
property.grantedAt = '123456789';
await property.save();


const address = await keyChain.keys.fetchById('address');
console.log(address);

const userx = await keyChain.read.fetchById('pubid1');
console.log(userx);

const prop = await user.properties.fetchById('address');
console.log(prop);
