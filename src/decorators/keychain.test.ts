
import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';
import keychain from './keychain';
import Keychain from './lib/keychain';

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

    it.skip('should attach a keychain', async () => {
        const person = new Person();

        const spy = vi.spyOn(person, 'initKeychainDefaults');

        expect(spy).toHaveBeenCalledOnce();
    });

    // it('should unlock the instance with a user', async () => {
    // });

    // it('should fetch keychain', async () => {});

    // it('should fetch property key', async () => {});

    // it('should encrypt property', async () => {});

    // it('should decrypt property', async () => {});
});