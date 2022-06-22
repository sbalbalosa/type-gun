import Gun from 'gun';
import 'gun/sea';
import { getGun } from "../helpers";

const sea = Gun.SEA;
const user = getGun().user();
const gun = getGun();

const createPromise = new Promise((resolve) => {
    user.create('test', 'khjgytgyu67876876', (data) => {
        resolve(data);
    });
});


const authPromise = new Promise((resolve) => {
    user.auth('test', 'khjgytgyu67876876', (data) => {
        resolve(data);
    });
});

const create = await createPromise;
const auth = await authPromise;

user.get('background').set({
    succ: 'success1',
});

const node = Gun.node.ify({
    succ: 'success'
});
user.put(node);
user.get('background').set(node);
user.get('background').get(node['_']['#']).once((data) => {
    console.log(data);
});


gun.get(node['_']['#']).put({
    succ: 'root-success'
}, (data) => {
    console.log(data);
});