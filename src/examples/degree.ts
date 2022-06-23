import { node, field } from "../decorators";

@node
export default class Degree {
  @field
  title: string = "title";
}
