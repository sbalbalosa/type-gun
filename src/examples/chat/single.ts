
import Keychain from "../../decorators/lib/keychain";
import { encrypted, keychain, root, field, edge, map } from "../../decorators";
import { userCreate, userAuth, getGun, getSea } from "../../helpers";
import MapQuery from "../../decorators/query/map";

const user = getGun().user();
const sea = getSea();
const gun = getGun();


console.time('auth');
await userCreate(user, 'test', 'Test1234');
await userAuth(user, 'test', 'Test1234');
console.timeEnd('auth');

// const sharePair = await sea.pair();
// const noSharePair = await sea.pair();
// const anotherSharePair = await sea.pair();

console.time('pair');
const [sharePair, noSharePair, anotherSharePair] = await Promise.all([sea.pair(), sea.pair(), sea.pair()]);
console.timeEnd('pair');

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
class Chat {
    @field
    name?: string;

    @edge(() => Messages)
    messages?: MapQuery
}

@keychain
@map
class Messages {
    @encrypted
    @field
    content?: string;
}

const chain = await Keychain.create(user, Messages);
await chain.grantRead('content', sharePair);

const chat = await Chat.create(gun);
chat.name = 'test';
await chat.save();

const message = await Messages.create(chat, (new Date()).getTime());
await message.attach(chain);
message.content = 'user1 content1';
await message.save();

const message1 = await Messages.create(chat, (new Date()).getTime());
await message1.attach(chain);
message1.content = 'user2 content2';
await message.save();

const message2 = await Messages.create(chat, (new Date()).getTime());
await message2.attach(chain);
message2.content = 'user3 content3';
await message2.save();

const messages = await chat.fetchAll();
console.log(messages);


