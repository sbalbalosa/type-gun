import { getGun, userCreate, userAuth } from "../helpers";

const user = getGun().user().recall({ sessionStorage: true });

export default class User {
    username: string = '';
    password: string = '';
    gunInstance = null;
    userNode = user;

    static async create(username: string, password: string) {
        const instance = new User();
        instance.username = username;
        instance.password = password;
        try {
            const createResult = await userCreate(this.userNode, instance.username, instance.password);
            if (createResult === true) {
                const loginResult = await instance.login();
                loginResult && (instance.gunInstance = user);
                return instance;
            }
        } catch(error) {

            /**
             * TODO: handle these cases
             * If user is already being created: "User is already being created or authenticated!"
             * If user already exists: "User already created!"
             */
            console.error(error.message);
            return null;
        }
    }

    async login () {
        try {
            const result = await userAuth(this.userNode, this.username, this.password);
        } catch(error) {
            console.error(error.message);
            return null;
        }
    }

    logout() {

    }

    changePassword() {

    }

    get isAuthenticated() {
        return this.userNode.is;
    }

    get publicKey() {

    }
}