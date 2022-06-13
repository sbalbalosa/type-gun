import { node, field } from "../decorators";
import Post from "./post";

// TODO: restrict save to only the owner of the object

@node(() => Post)
export default class Author {
  @field
  name: string;
}
