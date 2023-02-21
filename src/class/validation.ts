import { targetConstructorToSchema } from 'class-validator-jsonschema';
import Ajv, { ErrorObject } from "ajv";

import { PlainObject } from '../types';

const ajv = new Ajv();

export default class Validation {
    schema: ReturnType<typeof targetConstructorToSchema> = {};
    validate: ReturnType<typeof ajv.compile>;

    constructor(constructor: Function) {
        this.schema = targetConstructorToSchema(constructor);
        this.validate = ajv.compile(this.schema);
    }

    get properties(): string[] {
        return Object.keys(this.schema.properties ?? {});
    }

    get values(): PlainObject {
        return this.properties.reduce((result, key) => {
            return {
                ...result,
                [key]: (this as PlainObject)[key]
            };
        }, {} as PlainObject);
    }

    get errors(): ErrorObject[] {
        return this.validatePlainObject(this.values);
    }

    validatePlainObject(data: PlainObject): ErrorObject[] {
        const valid = this.validate(data);
        if (valid) return [];
        return this.validate.errors ?? [];
    }
}