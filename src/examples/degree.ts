import { node, field } from "../decorators";
import Profile from "./profile";

@node(() => Profile)
export default class Degree {
  @field
  title: string = "title";
}
