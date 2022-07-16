import { list, root, field, edge } from "../../decorators";
import { getGun } from "../../helpers";

@root
class Company {
    @field
    name?: string;

    @edge(() => Employee)
    employees?: null;
}

@list
class Employee {
    @field
    name?: string;
}

const company = Company.create(getGun());
company.name = 'tesla';
await company.save();

const employee = Employee.create(company);
employee.name = 'Elon Musk';
await employee.save();

const employees1 = await company.employees.fetchAll();
console.log(employees1);

const employee2 = Employee.create(company);
employee2.name = 'Random Guy';
await employee2.save();

const employees2 = await company.employees.fetchAll();
console.log(employees2);

await employee2.remove();
const employees3 = await company.employees.fetchAll();
console.log(employees3);

