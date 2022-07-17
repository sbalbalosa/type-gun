import { hydrateInstance } from "../field";
import { removeProperty } from "../../helpers";
export default class ListQuery {
    parent = null;
    target = null;
    name = null;
    constructor(parent, target, name) {
        this.parent = parent;
        this.target = target;
        this.name = name ? name : this.target.name.toLowerCase();
    }


    // TODO: looks similar to map and set

    listInstance() {
        if (this.parent.gunInstance()) {
            return this.parent.gunInstance().get(this.name);
        }
        throw new Error('No parent instance');
    }

    async isExist() {
        if (this.listInstance()) {
            return await this.listInstance().then() !== null;
        }
        throw new Error('No list instance');
    }

    private async fetchKeys() {
        if (this.listInstance()) {
            const keys = (await this.listInstance().then()) ?? {};
            const { lastIndex, ...rest} = keys;
            return rest;
        }
        throw new Error('No list instance');
    }

    async fetchById(id: number) {
        if (this.listInstance()) {
            const result = await this.listInstance().get(`${id}`).then();
            const instance = this.target.create(this.parent);
            instance.gunId = id;
            if (result) return hydrateInstance(instance, result);
            return null;
        }
        throw new Error('No map instance');
    }

    async fetchAll() {
        if (this.listInstance()) {
            const keys = await this.fetchKeys();
            let keyCount = Object.keys(removeProperty(keys, '_')).length;
            const instances = {};

            const emptyNodeCount = Object.values(keys).filter(v => v === null).length;
            let finalKeyCount = keyCount - emptyNodeCount;
            if (finalKeyCount === 0) return instances;

            const promise = new Promise(resolve => {
                this.listInstance().once().map().once((result, key) => {
                    if (keys[key]) finalKeyCount--;
                    if (result) {
                        const instance = this.target.create(this.parent);
                        instance.gunId = key;
                        instances[key] = hydrateInstance(instance, result);
                    }
                    if (finalKeyCount === 0) resolve(instances);
                });
            });
            return await promise;
        }
        throw new Error('No list instance');
    }

    async fetchLastIndex() {
        if (this.listInstance()) {
            const lastIndex = await this.listInstance().get('lastIndex').then();
            if (lastIndex) return lastIndex;
            throw new Error('No list item saved');
        }
        throw new Error('No list instance');
    }

    async fetchNext(node) {
        if (!node.gunId && node.gunId !== 0) throw new Error('Node has no index');
        const lastIndex = await this.fetchLastIndex();
        if (node.gunId === lastIndex) throw new Error('No next node');

        let current = node.gunId + 1;
        let result = null;
        while (current <= lastIndex) {
            result = await this.fetchById(current);
            if (result) return result;
            current++;
        }

        return result;
    }

    async fetchPrevious(node) {
        if (!node.gunId && node.gunId !== 0) throw new Error('Node has no index');
        if (node.gunId === 0) throw new Error('No previous node');
        

        let current = node.gunId - 1;
        let result = null;
        while (current >= 0) {
            result = await this.fetchById(current);
            if (result) return result;
            current--;
        }

        return result;
    }

    async fetchFirst() {
        return await this.fetchById(0);
    }

    async fetchLast() {
        const lastIndex = await this.fetchLastIndex();
        return await this.fetchById(lastIndex);
    }
}