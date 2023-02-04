import { hydrateInstance } from "../field";
import { removeProperty } from "../../helpers";
export default class SetQuery {
    parent = null;
    target = null;
    name = null;
    constructor(parent, target, name?: string) {
        this.parent = parent;
        this.target = target;
        this.name = name ? name : this.target.name.toLowerCase();
    }

    setInstance() {
        if (this.parent.gunInstance()) {
            return this.parent.gunInstance().get(this.name);
        }
        throw new Error('No parent instance');
    }

    async fetchKeys() {
        return (await this.setInstance().then()) ?? {};
    }

    async fetchById(id: string) {
        const result = await this.setInstance().get(id).then();
        if (!result) return null;
        const instance = this.target.create(this.parent);
        instance.gunId = result['_']['#'];
        return hydrateInstance(instance, result);
    }

    async fetchAll() {
        const keys = await this.fetchKeys();
        let keyCount = Object.keys(removeProperty(keys, '_')).length;
        const instances = [];

        if (keyCount === 0) return instances;

        const promise = new Promise(resolve => {
            this.setInstance().once().map().once((result, key) => {
                if (keys[key]) keyCount--;
                if (result) {
                    const instance = this.target.create(this.parent);
                    instance.gunId = key;
                    instances.push(hydrateInstance(instance, result));
                }
                if (keyCount === 0) resolve(instances);
            });
        });
        return await promise;
    }
}