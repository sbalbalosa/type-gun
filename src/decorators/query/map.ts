
import { hydrateInstance } from "../field";
import { removeProperty } from "../../helpers";
export default class MapQuery {
    parent = null;
    target = null;
    name = null;
    constructor(parent, target, name) {
        this.parent = parent;
        this.target = target;
        this.name = name ? name : this.target.name.toLowerCase();
    }

    mapInstance() {
        if (this.parent.gunInstance()) {
            return this.parent.gunInstance().get(this.name);
        }
        throw new Error('No parent instance');
    }

    async isExist() {
        if (this.mapInstance()) {
            return await this.mapInstance().then() !== null;
        }
        throw new Error('No map instance');
    }

    async fetchKeys() {
        if (this.mapInstance()) {
            return (await this.mapInstance().then()) ?? {};
        }
        throw new Error('No map instance');
    }

    async fetchById(id: string) {
        if (this.mapInstance()) {
            const result = await this.mapInstance().get(id).then();
            const instance = this.target.create(this.parent);
            instance.gunId = id;
            if (result) return hydrateInstance(instance, result);
            return null;
        }
        throw new Error('No map instance');
    }

    async fetchAll() {
        if (this.mapInstance()) {
            const keys = await this.fetchKeys();
            let keyCount = Object.keys(removeProperty(keys, '_')).length;
            const instances = {};

            if (keyCount === 0) return instances;

            const promise = new Promise(resolve => {
                this.mapInstance().once().map().once((result, key) => {
                    if (keys[key]) keyCount--;
                    if (result) {
                        const instance = this.target.create(this.parent);
                        instance.gunId = key;
                        instances[key] = hydrateInstance(instance, result);
                    }
                    if (keyCount === 0) resolve(instances);
                });
            });
            return await promise;
        }
        throw new Error('No map instance');
    }
}