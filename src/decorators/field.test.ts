import { describe, it, expect } from 'vitest';
import 'reflect-metadata';
import field, { createFieldRawData, getFields, hydrateInstance } from './field';

class Person {
  @field
  name?: string;

  @field
  age?: number;

  time?: string;
}

class NoField {
    test?: string;
}

describe('field', () => {
    it('should register instance property to metadata', () => {
        const fields = getFields(Person);

        expect(fields.find((field: string) => field === 'name')).toBe('name');
        expect(fields.find((field: string) => field === 'age')).toBe('age');
        expect(fields.find((field: string) => field === 'time')).not.toBe('time');
    });

    it('should fetch all the registered fields from metadata', () => {
        const fields = getFields(Person);

        expect(fields.length).toBe(2);

        const noFields = getFields(NoField);

        expect(noFields.length).toBe(0);
    });

    it('should transfer gun node data to instance', () => {
        const person = new Person();
        const node = {
            name: 'John',
            age: 1
        };

        const instance = hydrateInstance(person, node);

        expect(instance.name).toBe('John');
        expect(instance.age).toBe(1);
    });

    it('should create a new object with values coming from another object with decorated fields', () => {

        const person = new Person();
        person.name = 'David';
        person.age = 3;
        person.time = 'test';

        const raw = createFieldRawData(person, Person);

        expect(raw).toEqual({
            name: 'David',
            age: 3
        })
    });
});