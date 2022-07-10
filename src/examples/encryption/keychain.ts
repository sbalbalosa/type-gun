import Keychain from "../../decorators/lib/keychain";
import { encrypted, keychain, root, field } from "../../decorators";
import { userCreate, userAuth, getGun, getSea } from "../../helpers";

const user = getGun().user();
const sea = getSea();

await userCreate(user, 'test', 'Test1234');
await userAuth(user, 'test', 'Test1234');

const sharePair = await sea.pair();

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
console.log(chain);
