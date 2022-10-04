// NOTE: SEA certify example
import { userCreate, userAuth, getGun, getSea } from "../helpers";

const gun = getGun();
const user = gun.user();
const sea = getSea();

const kobe = await sea.pair();
const jordan = await sea.pair();
const lebron = await sea.pair();

const cert = await sea.certify(kobe.pub,  {"=":"inbox"}, jordan, null, { expiry: Date.now() + (60*60*24*1000) });

await gun.get('root').get('cert').put(cert).then();

user.auth(jordan, async () => {
    await user.get('inbox').get('message').get('chat').put('I am the goat').then();
    user.leave();

    user.auth(kobe, async () => {
        await gun.user(jordan.pub).get('inbox').get('message').get('chat').put('No, I am the goat', null, { opt: { cert }}).then();
        user.leave();

        window.setTimeout(() => {
            user.auth(lebron, async () => {
                gun.user(jordan.pub).get('inbox').get('message').get('chat').put('Lebron is the goat', () => {
                    debugger;
                }, { opt: { cert }});
                user.leave();
            
                window.setTimeout(() => {
                    window.localStorage.clear();
                }, 1000);
            });
        }, 3000);

    })
})

// await userCreate(user, 'test', 'Test1234');
// await userAuth(user, 'test', 'Test1234');

// await userCreate(user, 'shareuser', 'Test1234');
// await userAuth(user, 'shareuser', 'Test1234');

// await userCreate(user, 'noauthority', 'Test1234');
// await userAuth(user, 'noauthority', 'Test1234');

// const ownerPub = "~A0z5OOPujEfyPqyRrDE1FxJM_XJRlwYtOMiBvyWsvBU.VtZ9SaF2qmre9AxON2zz2-l7PTgfwPLe1sjw2bHEIJE";
// const otherPub = "~7NArtQ7_fyI2_5u5XZaTKEut5y7Ile0LBQIQpnalHis.rOleZyEA-K2M2h0UEnv5OAAzumX3oSn_3eHyci8ZKBY";
// const noPub = "~1YhShTBJd5xLBvhFi_x-0TrJDOlL4z5hB5cZde1hIao.qg2_if4fwB5gY97XekWD3U8liXNaolEP0N6ee6IFB4w";

// const certificate = await sea.certify(otherPub, 'profile/friendId', user._.sea, null, {expiry: Gun.state()+(60*60*24*1000)});

// await gun.get('root').get('testcert').put(certificate).then();
// const cert = await gun.get('root').get('testcert').then();


// // const node = await gun.get(ownerPub).get('profile').get('friendId').get('placeholder').then();
// debugger;

// await gun.get(ownerPub).get('profile').get('friendId').get('placeholder').put("overwrite", {opt: {cert}}).then();
// await gun.get(ownerPub).get('profile').get('firstName').put('no name', {opt: {cert}}).then();

// debugger;






// await user.get('profile').get('firstName').put('John').then();
// await user.get('profile').get('friendId').get('placeholder').put('slot').then();



// ? Question: could we set an anonymous gun node directly to set? Answer: No


// const node = Gun.node.ify({
//     test: 'test'
// });

// getGun().put(node);

// getGun().get("root").get('testset').set(node);


// getGun().get("root").get('testset').get(node['_']['#']).once((data) => {
//     console.log(data);
// });

// const metadata = await getGun().get('root').get('profile').get('posts').then();
// getGun().get('root').get('profile').get('posts').once().map().once((data, key) => {
// });


