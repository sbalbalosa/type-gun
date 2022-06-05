import Profile from "./profile";
import Degree from "./degree";
import University from "./university";

const profile = new Profile();
profile.firstName = "John";
profile.lastName = "Doe";
profile.save();

const degree = new Degree();
degree.title = "Information Technology";
degree.save();

// const updatedProfile = await Profile.fetch(() => [Degree]);
// console.log(updatedProfile.degree);
// console.log(updatedProfile);

const university = new University();
university.name = "DLSU-D-test";
university.save();

const profileWithUniversity = await University.fetch(() => [Profile]);
console.log(profileWithUniversity.profile);
