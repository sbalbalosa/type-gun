import { getGun } from "../helpers";
import { root, field, edge } from "../decorators";

import Degree from "./degree";

const gun = getGun();

@root(gun)
export default class Profile {
  @field
  firstName: string = "test";

  @field
  lastName: string = "test1";

  fullName: string = "";

  @edge(() => Degree)
  degree?: Degree;
}
