import { describe, it, expect, vi } from 'vitest';
import 'reflect-metadata';
import encrypted, { createDecryptedData, createEncryptedData, getEncrypteds } from './encrypted';

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
const mockDecryptionFn = vi.fn((_, value) => (`decrypted${value}` as any));


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
        expect(result).toEqual(raw);
    });

    it('should not encrypt data when instance has no keychain', async () => {
        const person = new Person();
        person.name = 'David';
        person.age = 3;
        person.hasKeychain = false;
        const raw = { name: person.name, age: person.age };

        const result = await createEncryptedData(raw, person, Person);
        expect(result).toEqual(raw);
    });

    it('should create decrypted data', async () => {
        const raw = {
            name: 'encryptedName',
            age: 'encryptedAge',
        };
        const mockFetchKeychainFn = vi.fn(() => Promise.resolve({
            isAuthorityOwner: vi.fn(() => true),
        }));
        const person = new Person();
        person.hasKeychain = true;
        person.decryptProperty =  mockDecryptionFn;
        person.fetchKeychain = mockFetchKeychainFn;

        const result = await createDecryptedData(raw, person, Person);
        expect(result).toEqual({ name: `decrypted${raw.name}`, age: `decrypted${raw.age}` });
    });

    it('should not decrypt data when instance has no keychain', async () => {
        const raw = {
            name: 'encryptedName',
            age: 'encryptedAge',
        };
        const person = new Person();
        person.hasKeychain = false;
        const result = await createDecryptedData(raw, person, Person);
        expect(result).toEqual(raw);
    });

    it('should not decrypt data when there are no encrypted fields', async () => {
        const noField = new NoField();
        noField.test = 'test';
        noField.hasKeychain = true;
        noField.decryptProperty =  mockDecryptionFn;
        const raw = { test: noField.test };

        const result = await createDecryptedData(raw, noField, NoField);
        expect(result).toEqual(raw);
    });

    it('should not decrypt data when the attached authority is not the owner of data', async () => {
        const raw = {
            name: 'encryptedName',
            age: 'encryptedAge',
        };

        const mockFetchKeychainFn = vi.fn(() => Promise.resolve({
            isAuthorityOwner: vi.fn(() => false), 
        }));
        const mockDecryptionFn = vi.fn(() => {
            throw new Error('test');
        });
        const person = new Person();
        person.hasKeychain = true;
        person.decryptProperty =  mockDecryptionFn;
        person.fetchKeychain = mockFetchKeychainFn;

        const result = await createDecryptedData(raw, person, Person);
        expect(result).toEqual(raw);
    });

    it('should throw an error if data could not be decrypted and attached authority is the owner', async () => {
        const raw = {
            name: 'encryptedName',
            age: 'encryptedAge',
        };

        const mockFetchKeychainFn = vi.fn(() => Promise.resolve({
            isAuthorityOwner: vi.fn(() => true), 
        }));
        const mockDecryptionFn = vi.fn(() => {
            throw new Error('testError');
        });
        const person = new Person();
        person.hasKeychain = true;
        person.decryptProperty =  mockDecryptionFn;
        person.fetchKeychain = mockFetchKeychainFn;

        await expect(createDecryptedData(raw, person, Person)).rejects.toThrow('testError');
    });
});