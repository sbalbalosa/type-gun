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

const employeeX = Employee.create(company);
employeeX.name = 'Jeff Bezos';
await employeeX.save();

const checkAllEmployees = await company.employees.fetchAll();
console.log(checkAllEmployees);

const firstEmployee = await company.employees.fetchFirst();
const lastEmployee = await company.employees.fetchLast();

console.log(firstEmployee);
console.log(lastEmployee);

await employee2.remove();
const removeRandomGuy = await company.employees.fetchAll();
console.log(removeRandomGuy);

const fetchRandomGuy = await company.employees.fetchById(1);
console.log(fetchRandomGuy);

const first = Employee.create(company, 0);
await first.sync();
first.name = 'Elyon';
await first.save();

const checkAllEmployees2 = await company.employees.fetchAll();
console.log(checkAllEmployees2);

const jeff = await company.employees.fetchNext(first);
const elyon = await company.employees.fetchPrevious(employeeX);

console.log(jeff);
console.log(elyon);

