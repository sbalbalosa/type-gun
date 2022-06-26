import { root, field, edge, node } from "../decorators";
import Posts from "./posts";
import Degree from './degree';

@node
export default class Profile {
  @field
  firstName: string = "test";

  @field
  lastName: string = "test1";

  fullName: string = "";

  @edge(() => Posts)
  posts?: null; 

  @edge(() => Degree)
  degree?: null;
}
