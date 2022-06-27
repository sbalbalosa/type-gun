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
import Employees from "./map/employees";
import KeyChain from "../decorators/lib/key-chain";
import ReadAccess from "../decorators/lib/read-access";
import PropertyAccess from "../decorators/lib/property-access";
import PublicAccess from "../decorators/lib/public-access";
import { getGun } from "../helpers";

const organization = Organization.create(getGun());
organization.name = "test";
await organization.save();

const keyChain = KeyChain.create(organization);
keyChain.owner = "ownerid";
await keyChain.save();

const readAccess = ReadAccess.create(keyChain, 'pubid1');
readAccess.grantedAt = '12314123';
readAccess.key = 'faasfqwekey';
await readAccess.save();


const readAccess1 = ReadAccess.create(keyChain, 'pubid2');
readAccess1.grantedAt = '4564564565634';
readAccess1.key = 'sdrqweqwe';
await readAccess1.save();

const all = await keyChain.readAccess.fetchAll();
console.log(all);
