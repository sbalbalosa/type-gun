import { getGun, userCreate, userAuth, userChangePassword } from "../helpers";

const user = getGun().user().recall({ sessionStorage: true });

export default class User {
    gunReference = null;

    gunInstance() {
        return this.gunReference;
    }

    static async create(username: string, password: string) {
        const instance = new User();
        if (user.is) {
            instance.gunReference = user;
            return instance;
        }
        try {
            const createResult = await userCreate(user, username, password);
            if (createResult === true) {
                const loginResult = await userAuth(user, username, password);
                loginResult && (instance.gunReference = user);
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
            const authResult = await userAuth(this.gunInstance(), username, password);
            if (authResult) return true;      
        } catch(error) {
            // TODO: throw error here instead of catching
            console.error(error.message);
        }
        return null;
    }

    logout() {
        this.gunInstance.leave();
    }

    async changePassword(username: string, password: string, newPassword: string) {
        try {
            const authResult = await userChangePassword(this.gunInstance(), username, password, newPassword);
            if (authResult) return true;      
        } catch(error) {
            // TODO: throw error here instead of catching
            console.error(error.message);
        }
        return null;
    }

    remove(username: string, password: string) {
        user.delete(username, password, (ack) => {

        });
    }

    get isAuthenticated() {
        return !!this.gunInstance().is;
    }

    get publicKey() {
        return this.gunInstance().is.pub;

    }

    // TODO: gun.on( 'auth', ack => console.log('Authentication was successful: ', ack))
}