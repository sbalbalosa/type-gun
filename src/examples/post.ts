import { field, edge } from "../decorators";
import set from "../decorators/set";

import Profile from "./profile";
import Author from "./author";

@set(() => Profile)
export default class Post {
  @field
  title: string;

  @field
  content: string;

  @edge(() => Author)
  author: Author;
}
