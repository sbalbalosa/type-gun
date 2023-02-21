import { IGunChain, IGunOnEvent } from 'gun';

import { createFieldRawData, hydrateInstance, createEmptyData } from '../decorators/field';
import { GunRecord, PlainObject} from '../types';
import { getRecord, putRecord, subscribeRecord, isRecordExist } from '../helpers';
import Validation from './validation';

export default class Entity {
    #parent: Entity;
    #id: string;
    #validation: Validation;
    #subscription?: IGunOnEvent;

    constructor(config: {
        parent: Entity,
        validation?: Validation
        name?: string
    }) {
        this.#id = config.name ?? this.constructor.name;
        this.#parent = config.parent;

        this.#validation = config.validation ?? new Validation(this.constructor);
    }

    get schema() {
        return this.#validation.schema
    }

    get instance(): IGunChain<any> {
        if (this.#parent.instance && this.#id) {
            return this.#parent.instance.get(this.#id);
        }
        throw new Error('No instance');
    }

    get raw(): GunRecord {
        return createFieldRawData(this as unknown as GunRecord, this.constructor);
    }

    async hydrate() {
        try {
            const validRecord: GunRecord = {};
            const record = await getRecord(this.instance);
            const errors = this.#validation.validatePlainObject(record).reduce((result, error) => {
                return {
                    ...result,
                    [error.instancePath.substring(1)]: true
                }
            }, {} as PlainObject);

            for(const key in record) {
                if (errors[key]) continue;
                
                validRecord[key] = record[key];
            }

            hydrateInstance(this as unknown as GunRecord, validRecord);
        } catch(error) {
            throw error;
        }   
    }

    async save(): Promise<boolean> {
        if (this.#validation.errors.length === 0) {
            await putRecord(this.instance, this.raw);
            return true;
        }

        return false;
    }

    async remove() {
        if (this.#subscription) {
            this.unsubscribe();
        }

        const empty = createEmptyData(this.constructor);
        await putRecord(this.instance, empty);
        await putRecord(this.instance, null);
    }

    subscribe(callback: (entity: Entity, record: GunRecord) => void) {
        if (this.#subscription) throw new Error('Subscription already exist');

        isRecordExist(this.instance).then((existing) => {
            if (existing) {
            subscribeRecord(this.instance, (record, subscription) => {
                        this.#subscription = subscription;
                        hydrateInstance(this as unknown as GunRecord, record);
                        callback(this, record);
                    });
            }
        })
    }

    unsubscribe() {
        if (this.#subscription) {
            this.#subscription.off();
            return;
        }
        
        throw new Error('No subscription');
    }
}