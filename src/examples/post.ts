import { field } from "../decorators";
import set from "../decorators/set";

import Profile from "./profile";

@set(() => Profile)
export default class Post {
  @field
  title: string;

  @field
  content: string;
}
