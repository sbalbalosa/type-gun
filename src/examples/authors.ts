import { field, node } from "../decorators";

@node
export default class Author {
  @field
  name?: string;
}
