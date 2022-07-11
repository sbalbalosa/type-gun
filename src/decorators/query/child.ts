import { hydrateInstance } from "../field";
import { setupEdges } from "../edge";
export default class ChildQuery {
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
            const instance = new this.target();
            instance.gunId = this.name;
            instance.parentNode = this.parent;
            instance.detached = true;
            if (result) return hydrateInstance(setupEdges(instance), result);
            return null;
        }
        throw new Error('No parent instance');
    }
}