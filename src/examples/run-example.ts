import './gun-experiments';
import testUser from './create-user';
import Profile from "./profile";


const user = await testUser();

const profile = Profile.create(user);
profile.firstName = 'Save to user';
profile.save();

// profile.save();