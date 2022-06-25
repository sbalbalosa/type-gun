import { getGun, userCreate, userAuth } from "../helpers";

const user = getGun().user().recall({ sessionStorage: true });

export default class User {
    gunInstance = null;
    userNode = user;

    static async create(username: string, password: string) {
        if (user.is) {
            throw new Error('Existing authenticated user');
        }
        const instance = new User();
        try {
            const createResult = await userCreate(user, username, password);
            if (createResult === true) {
                const loginResult = await instance.login(username, password);
                loginResult && (instance.gunInstance = user);
                return instance;
            }
        } catch(error) {
            // TODO: throw error here instead of catching

            /**
             * TODO: handle these cases
             * If user is already being created: "User is already being created or authenticated!"
             * If user already exists: "User already created!"
             */
            console.error(error.message);
        }
        return null;
    }

    async login (username: string, password: string) {
        try {
            const authResult = await userAuth(this.userNode, username, password);
            if (authResult) return true;      
        } catch(error) {
            // TODO: throw error here instead of catching
            console.error(error.message);
        }
        return null;
    }

    logout() {
        this.userNode.leave();
    }

    changePassword() {

    }

    remove(username: string, password: string) {
        user.delete(username, password, (ack) => {

        });
    }

    get isAuthenticated() {
        return this.userNode.is;
    }

    get publicKey() {

    }

    // TODO: gun.on( 'auth', ack => console.log('Authentication was successful: ', ack))
}