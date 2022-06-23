import { root, field } from "../decorators";

@root
export default class Profile {
  @field
  firstName: string = "test";

  @field
  lastName: string = "test1";

  fullName: string = "";
}
