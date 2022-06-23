import { hydrateInstance } from "../decorators/field";
import { removeProperty } from "../helpers";
export default class MultipleQuery {
    parent = null;
    target = null;
    constructor(parent, target) {
        this.parent = parent;
        this.target = target;
    }

    setInstance() {
        if (this.parent.gunInstance()) {
            return this.parent.gunInstance().get(this.target.name.toLowerCase());
        }
        throw new Error('No parent instance');
    }

    async fetchKeys() {
        if (this.setInstance()) {
            return (await this.setInstance().then()) ?? {};
        }
        throw new Error('No set instance');
    }

    async fetchById(id: string) {
        if (this.setInstance()) {
            const result = await this.setInstance().get(id).then();
            const instance = this.target.create(this.parent);
            instance.gunId = result['_']['#'];
            if (result) return hydrateInstance(instance, result);
            return null;
        }
        throw new Error('No set instance');
    }

    async fetchAll() {
        if (this.setInstance()) {
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
        throw new Error('No set instance');
    }
}