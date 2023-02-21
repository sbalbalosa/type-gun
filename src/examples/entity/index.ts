import Entity from "../../class/entity";
import { field } from "../../decorators";
import { createPublicRoot } from "../../helpers";
import { IsString, MinLength } from "class-validator";

class Person extends Entity {
    @field
    @IsString()
    @MinLength(5)
    firstName?: string;

    @field
    lastName?: string;
}

const app = await createPublicRoot('app');

const person = new Person({ parent: app });
person.firstName = 'asas';
// person.lastName = 'Doe';

// await person.save();
console.log(person);

// person.subscribe((entity, record) => {
//     console.log(record);
// });


// person.firstName = 'John';
// await person.save();

// person.lastName = 'Adam';
// await person.save();

// person.lastName = 'Test';
// await person.save();

/*

const persons = new Collection(Person);
const person = persons.create(); -> instance.get('person_collection');
person.firstName = 'test';
await persons.insert(person);
const person1 = await persons.fetchOne();
*/


// app.instance.path('test.le46s18rxVS8qfNAyROb').once((data) => {
//     debugger;
// });

