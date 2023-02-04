
import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';
import keychain from './keychain';
import Keychain from './lib/keychain';

vi.stubGlobal('sea', {});

@keychain
class Person {
  time?: string;
}
const mockAuthority = {
    test: 'test'
};

describe('keychain', () => {
    beforeEach(() => {
        Keychain.prototype.fetchAuthority = vi.fn(() => mockAuthority);
    })
    it('should have default properties', () => {
        const person = new Person();

        person.initKeychainDefaults();

        expect(person.keychain).toBe(null);
        expect(person.userInstance).toBe(null);
        expect(person.hasKeychain).toBe(true);
    });

    it('should fetch authority if it exist', () => {
        const person = new Person();
        let authority = person.fetchAuthority();

        expect(authority).toBe(mockAuthority);

        Keychain.prototype.fetchAuthority = vi.fn(() => null);

        expect(() => {
            authority = person.fetchAuthority();
        }).toThrowError('No authority set');
    });

    it('should attach a keychain', async () => {
        const person = new Person();
        person.connect = vi.fn(() => Promise.resolve());
        const mockKeychain = {
            userInstance: 'test',
            childLink:  () => 'test',
        }

        await person.attach(mockKeychain);

        expect(person.userInstance).toBe(mockKeychain.userInstance);
        expect(person.connect).toBeCalledWith('keychain', mockKeychain.childLink());
    });

    it('should not attach a keychain when there is no assigned user', async () => {
        const person = new Person();
        const mockKeychain = {
            userInstance: undefined,
            childLink:  () => 'test',
        }

        await expect(person.attach(mockKeychain)).rejects.toThrowError('keychain has no user instance');
    });

    it('should assign a user instance to try to unlock a keychain', async () => {
        const person = new Person();
        person.query = vi.fn(() => Promise.resolve());

        await person.unlock('test');

        expect(person.userInstance).toBe('test');
        expect(person.query).toBeCalledWith('keychain', Keychain.childQuery);
    });

    it('should fetch the keychain', async () => {
        const person = new Person();
        person.userInstance = 'testUserInstance';
        let mockKeychain = {
            userInstance: null,
        }
        person.keychain = {
            fetch: vi.fn(() => Promise.resolve(mockKeychain)),
        }

        const keychain = await person.fetchKeychain();
        expect(keychain.userInstance).toBe(person.userInstance);
    });

    it('should not fetch the keychain when it does not exist', async () => {
        const person = new Person();
        person.keychain = {
            fetch: vi.fn(() => Promise.resolve(undefined)),
        }

        await expect(person.fetchKeychain()
        ).rejects.toThrowError('No keychain');
    });

    it('should not fetch the keychain when instance does not have assigned user', async () => {
        const person = new Person();
        person.userInstance = undefined;
        person.keychain = {
            fetch: vi.fn(() => Promise.resolve(true)),
        }

        await expect(person.fetchKeychain()
        ).rejects.toThrowError('No user instance');
    });

    it('should fetch property key', async () => {
        const person = new Person();
        person.fetchKeychain = vi.fn(() => Promise.resolve({
            fetchPropertyKeyAccess: vi.fn(() => Promise.resolve('time')),
        }));
        
        const key = await person.fetchPropertyKey('time');
        expect(key).toBe('time');

        person.fetchKeychain = vi.fn(() => Promise.resolve({
            fetchPropertyKeyAccess: vi.fn(() => Promise.resolve(undefined)),
        }));

        await expect(person.fetchPropertyKey('time')).rejects.toThrowError('No property key');
    });

    it('should encrypt property', async () => {
        const person = new Person();

        const mockEncryptProperty = vi.fn(() => Promise.resolve('encrypted')); 
        person.fetchKeychain = vi.fn(() => Promise.resolve({
            encryptProperty: mockEncryptProperty,
        }));
        
        const encrypted = await person.encryptProperty('time', 'test');
        expect(mockEncryptProperty).toBeCalledWith('time', 'test');
        expect(encrypted).toBe('encrypted');
    });

    it('should decrypt property', async () => {
        const person = new Person();
        const mockDecryptProperty = vi.fn(() => Promise.resolve('decrypted')); 
        person.fetchKeychain = vi.fn(() => Promise.resolve({
            decryptProperty: mockDecryptProperty,
        }));
        
        const decrypted = await person.decryptProperty('time', 'test');
        expect(mockDecryptProperty).toBeCalledWith('time', 'test');
        expect(decrypted).toBe('decrypted');
    });
});