import { getGun } from "../helpers";
import { root, field, edge } from "../decorators";

import Post from "./post";

const gun = getGun();

@root(gun)
export default class Profile {
  @field
  firstName: string = "test";

  @field
  lastName: string = "test1";

  fullName: string = "";

  @edge(() => Post)
  post?: Post;
}
