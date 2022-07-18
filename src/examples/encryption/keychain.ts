import Keychain from "../../decorators/lib/keychain";
import { encrypted, keychain, root, field } from "../../decorators";
import { userCreate, userAuth, getGun, getSea } from "../../helpers";

const user = getGun().user();
const sea = getSea();

await userCreate(user, 'test', 'Test1234');
await userAuth(user, 'test', 'Test1234');

const sharePair = await sea.pair();
const anotherSharePair = await sea.pair();

@root
@keychain
class Person {

    @field
    @encrypted
    sssNumber?: string;

    @field
    @encrypted
    workNumber?: string;
}

const chain = await Keychain.create(user, Person);
await chain.grantRead('sssNumber', sharePair);
await chain.grantRead('sssNumber', anotherSharePair);
await chain.revokeRead('sssNumber', sharePair);
console.log(chain);

const chain2 = await Keychain.create(user, Person);
await chain2.grantRead('workNumber', sharePair);
console.log(chain2);

