import Gun from 'gun';
import 'gun/sea';
import { getGun } from "../helpers";

const sea = Gun.SEA;
const user = getGun().user();
const gun = getGun();


export default async function testUser() {
    // const createPromise = new Promise((resolve) => {
    //     user.create('test', 'khjgytgyu67876876', (data) => {
    //         resolve(data);
    //     });
    // });


    const authPromise = new Promise((resolve) => {
        user.auth('test', 'khjgytgyu67876876', (data) => {
            resolve(data);
        });
    });
    // const create = await createPromise;
    const auth = await authPromise;
    return user;
}