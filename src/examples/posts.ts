import { field } from "../decorators";
import set from "../decorators/set";

@set
export default class Posts {
  @field
  title?: string;

  @field
  content?: string;
}
