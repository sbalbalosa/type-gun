import { field } from "../decorators";
import set from "../decorators/set";

@set
export default class Author {
  @field
  name?: string;
}
