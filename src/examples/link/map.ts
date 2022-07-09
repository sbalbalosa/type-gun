import { map, root, field, link } from "../../decorators";
import { getGun } from "../../helpers";

@root
class Company {
    @field
    name?: string;

    @link
    employees? = null;

    @link
    ceo? = null;
}

// TODO: found an issue map is not working if under root

@root
class Resources {
    @field
    name?: string;
}

@map
class Employee {
    @field
    name?: string;
}


const company = Company.create(getGun());
company.name = 'tesla';
await company.save();

const resources = Resources.create(getGun());
resources.name = 'persons';
await resources.save();

const employee = Employee.create(resources, 'employee1');
employee.name = 'Elon Musk';
await employee.save();

const employee2 = Employee.create(resources, 'employee2');
employee2.name = 'Random Guy';
await employee2.save();

await company.connect('employees', employee.mapLink());
const employeesNode = await company.employees.fetchAll();
console.log(employeesNode);

const randomGuy = await company.employees.fetchById('employee2');
console.log(randomGuy);

await company.connect('ceo', employee.link());
const employeeNode = await company.ceo.fetch();
console.log(employeeNode);