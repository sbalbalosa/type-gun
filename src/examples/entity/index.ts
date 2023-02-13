import Entity from "../../class/entity";
import { field } from "../../decorators";
import { createPublicRoot } from "../../helpers";
import { IsString, MinLength } from "class-validator";

class Person extends Entity {
    @field
    @IsString()
    @MinLength(3)
    firstName?: string;

    @field
    lastName?: string;
}

const app = await createPublicRoot('app');

const person = new Person(app);
person.firstName = 'asas';
person.lastName = 'Doe';

await person.save();

// person.subscribe((entity, record) => {
//     console.log(record);
// });


// person.firstName = 'John';
// await person.save();

// person.lastName = 'Adam';
// await person.save();

// person.lastName = 'Test';
// await person.save();

