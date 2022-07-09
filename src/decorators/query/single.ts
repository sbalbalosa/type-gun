import { hydrateInstance } from "../field";
export default class SingleQuery {
    parent = null;
    target = null;
    name = null;
    constructor(parent, target, name) {
        this.parent = parent;
        this.target = target;
        this.name = name ? name : this.target.name.toLowerCase();
    }

    gunInstance() {
        if (this.parent.gunInstance()) {
            return this.parent.gunInstance().get(this.name);
        }
        throw new Error('No parent instance');
    }

    async fetch() {
        if (this.gunInstance()) {
            const result = await this.gunInstance().then();
            const instance = this.target.create(this.parent);
            if (result) return hydrateInstance(instance, result);
            return null;
        }
        throw new Error('No parent instance');
    }
}