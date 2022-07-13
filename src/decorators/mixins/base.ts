import { createDecryptedData } from "../encrypted";
import { hydrateInstance } from "../field";

export default function baseMixin(constructor) {
  constructor.prototype.sync = async function() {
    if (this.gunInstance()) {
      let result = await this.gunInstance().then();
      if (result === undefined) return this;
      if (result === null) throw new Error('Cannot sync deleted node');
      result = await createDecryptedData(result, this, constructor);
      return hydrateInstance(this, result);
    }
    throw new Error('No gun instance');
  }
}