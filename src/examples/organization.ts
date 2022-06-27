import { root, edge, field } from "../decorators";
import Employees from "../examples/map/employees";
import MapQuery from  "../decorators/query/map";

@root
export default class Organization {
  @field
  name?: string;

  @edge(() => Employees)
  employees?: MapQuery;
}