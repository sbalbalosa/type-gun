import { hydrateInstance } from "../decorators/field";
export default class SingleQuery {
    parent = null;
    target = null;
    constructor(parent, target) {
        this.parent = parent;
        this.target = target;
    }

    gunInstance() {
        if (this.parent.gunInstance()) {
            return this.parent.gunInstance().get(this.target.name.toLowerCase());
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