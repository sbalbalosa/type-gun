import { node, field, edge } from "../decorators";
import Degree from "./degree";
import Profile from "./profile";

@node(() => Degree)
export default class University {
  @field
  name: string = "DLSU-D";

  @edge(() => Profile)
  profile?: Profile;
}
