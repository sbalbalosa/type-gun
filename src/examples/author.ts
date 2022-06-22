import { edge, field } from "../decorators";
import set from "../decorators/set";
import Post from "./post";
import Profile from './profile';

// TODO: restrict save to only the owner of the object

@set(() => Post)
export default class Author {
  @field
  name: string;


  // @edge(() => Profile)
  // profile: Profile;
}
