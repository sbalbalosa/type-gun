import { root, field, link } from "../../decorators";
import { getGun } from "../../helpers";

@root
class Employee {
    @field
    type?: string;

    @link
    person? = null;
}

@root
class Person {
    @field
    name?: string;

    @link
    employee? = null;
}


const employee = Employee.create(getGun());
employee.type = 'manager';
await employee.save();

const person = Person.create(getGun());
person.name = 'John';
await person.save();

await person.connect('employee', employee.link());
const employeeNode = await person.employee.fetch();
console.log(employeeNode);

await employee.connect('person', person.link());
const personNode = await employee.person.fetch();
console.log(personNode);