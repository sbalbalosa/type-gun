
import { describe, it, expect } from 'vitest';
import 'reflect-metadata';
import link, { isLinkPropertyExist, linkMetadataKey } from './link';

describe('link', () => {
    it('should register link properties to metadata', () => {
        class Person {
            name?: string;

            @link
            profile?: null;
        }
        new Person();
        const metadata =  Reflect.getMetadata(linkMetadataKey, Person);
        expect(metadata.profile).toBeDefined();

        expect(metadata.name).not.toBeDefined();
    });

    it('should check if the link property exist', () => {
        class Person {
            name?: string;

            @link
            profile?: null;
        }
        expect(isLinkPropertyExist(Person, 'profile')).toBe(true);   
        expect(isLinkPropertyExist(Person, 'name')).toBe(false);
    });
});