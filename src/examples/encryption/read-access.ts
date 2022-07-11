
import Keychain from "../../decorators/lib/keychain";
import { encrypted, keychain, root, field } from "../../decorators";
import { userCreate, userAuth, getGun, getSea } from "../../helpers";

const user = getGun().user();
const sea = getSea();
const gun = getGun();

await userCreate(user, 'test', 'Test1234');
await userAuth(user, 'test', 'Test1234');

const sharePair = await sea.pair();
const testUserInstance = {
    _: {
        sea: sharePair
    }
};

@root
@keychain
class Person {

    @field
    @encrypted
    sssNumber?: string;
}

const chain = await Keychain.create(user, Person);
await chain.grantReadProperty('sssNumber', sharePair);
await chain.revokeReadProperty('sssNumber', sharePair);

const person = Person.create(gun);
await person.attachKeychain(chain);
person.sssNumber = 2414123;
await person.save();

const person1 = Person.create(gun);
person1.userInstance = testUserInstance;
await person1.sync();
console.log(person1);
