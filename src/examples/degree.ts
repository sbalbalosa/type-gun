import { node, field, edge } from "../decorators";
import Author from "./authors";

@node
export default class Degree {
  @field
  title: string = "title";

  @edge(() => Author)
  author?: null;
}
