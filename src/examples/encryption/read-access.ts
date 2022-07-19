
import Keychain from "../../decorators/lib/keychain";
import { encrypted, keychain, root, field } from "../../decorators";
import { userCreate, userAuth, getGun, getSea } from "../../helpers";

const user = getGun().user();
const sea = getSea();
const gun = getGun();

await userCreate(user, 'test', 'Test1234');
await userAuth(user, 'test', 'Test1234');

const sharePair = await sea.pair();
const noSharePair = await sea.pair();
const anotherSharePair = await sea.pair();

const testUserInstance = {
    _: {
        sea: sharePair
    }
};

const noAccessUserInstance = {
    _: {
        sea: noSharePair
    }
};

const anotherUserInstance = {
    _: {
        sea: anotherSharePair
    }
}

@root
@keychain
class Person {
    @encrypted
    @field
    sssNumber?: number;

    @encrypted
    @field
    workNumber?: number;

    @encrypted
    @field
    email?: string;
}

const chain = await Keychain.create(user, Person);

await Promise.all([
    chain.grantRead('workNumber', sharePair),
    chain.grantRead('sssNumber', sharePair),
    chain.grantRead('sssNumber', anotherSharePair)
]);

// TODO: grant multiple read property
// TODO: revoke multiple read property

const person = await Person.create(gun);
await person.attach(chain);
person.sssNumber = 2414123;
person.workNumber = 345235234;
person.email = 'test@test.com'
await person.save();


const person1 = await Person.create(gun)
await person1.unlock(testUserInstance);
await person1.sync();
console.log(person1);

await chain.revokeRead('sssNumber', sharePair);
await person1.sync();
console.log(person1);

person.sssNumber = 235235234;
await person.save();

const person2 = await Person.create(gun)
await person2.unlock(noAccessUserInstance);
await person2.sync();
console.log(person2);

const person3 = await Person.create(gun);
await person3.unlock(anotherUserInstance);
await person3.sync();
console.log(person3);

// const chain1 = await Keychain.create(user, Person);
// await chain1.grantRead('email', sharePair);
// await person1.sync();
// console.log(person1);


// console.time('read');
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// await person1.sync();
// console.timeEnd('read');

// console.log(person1);
