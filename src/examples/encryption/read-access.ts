
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

@root
@keychain
class Person {

    @encrypted
    @field
    sssNumber?: number;

    @encrypted
    @field
    workNumber?: number;
}

const chain = await Keychain.generate(user, Person);
await chain.grantReadProperty('sssNumber', sharePair);
await chain.grantReadProperty('workNumber', sharePair);

// TODO: fetch keychain from scratch
// TODO: null default for no access

const person = Person.create(gun);
await person.attachKeychain(chain);
person.sssNumber = 2414123;
person.workNumber = 345235234;
await person.save();

const person1 = Person.create(gun);
person1.initKeychain(testUserInstance);
await person1.sync();
console.log(person1);

const person2 = Person.create(gun);
person2.initKeychain(noAccessUserInstance);
try {
    await person2.sync();
} catch(e) {
    console.error(e);
}
