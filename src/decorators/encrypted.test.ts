import { describe, it, expect, vi } from 'vitest';
import 'reflect-metadata';
import encrypted, { createEncryptedData, getEncrypteds } from './encrypted';

class Person {
  @encrypted
  name?: string;

  @encrypted
  age?: number;

  time?: string;
}

class NoField {
    test?: string;
}

const mockEncryptionFn = vi.fn((_, value) => (`encrypted${value}`));

describe('encrypted', () => {
    it('should register decorated encrypted property to metadata', () => {
        const fields = getEncrypteds(Person);

        expect(fields.find((field: string) => field === 'name')).toBe('name');
        expect(fields.find((field: string) => field === 'age')).toBe('age');
        expect(fields.find((field: string) => field === 'time')).not.toBe('time');
    });

    it('should fetch all the registered encrypteds from metadata', () => {
        const fields = getEncrypteds(Person);

        expect(fields.length).toBe(2);

        const noFields = getEncrypteds(NoField);

        expect(noFields.length).toBe(0);
    });

    it('should create encrypted data', async () => {
        const person = new Person();
        person.name = 'David';
        person.age = 3;
        person.hasKeychain = true;
        person.encryptProperty =  mockEncryptionFn;
        const raw = { name: person.name, age: person.age };

        const result = await createEncryptedData(raw, person, Person);
        expect(result).toEqual({ name: `encrypted${person.name}`, age: `encrypted${person.age}` });

    });

    it('should not encrypt data when there are no encrypted fields', async () => {
        const noField = new NoField();
        noField.test = 'test';
        noField.hasKeychain = true;
        noField.encryptProperty =  mockEncryptionFn;
        const raw = { test: noField.test };

        const result = await createEncryptedData(raw, noField, NoField);
        expect(result).toEqual({ test: 'test' });
    });

    // it('should create decrypted data', async () => {


    // });

    // it('should create a new object with values coming from another object with decorated fields', () => {

    //     const person = new Person();
    //     person.name = 'David';
    //     person.age = 3;
    //     person.time = 'test';

    //     const raw = createFieldRawData(person, Person);

    //     expect(raw).toEqual({
    //         name: 'David',
    //         age: 3
    //     })
    // });
});