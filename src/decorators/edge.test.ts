import { describe, it, expect } from 'vitest';
import 'reflect-metadata';
import edge, { setupEdges, edgeMetadataKey } from './edge';
import SetQuery from './query/set'; 
import SingleQuery from './query/single';
import MapQuery from './query/map';
import ListQuery from './query/list';

describe('edge', () => {
    it('should register edge properties to metadata', () => {
        class Person {
            name?: string;

            @edge(() => ({
                nodeType: 'single'
            }) as any)
            profile?: null;
        }
        new Person();
        const metadata =  Reflect.getMetadata(edgeMetadataKey, Person);
        expect(metadata.profile).toBeDefined();

        expect(metadata.name).not.toBeDefined();
    });

    it('should initialize edge fields on an instance with proper query object', () => {
        class Person {
            @edge(() => ({
                nodeType: 'single',
                name: 'test'
            }) as any)
            single?: null;

            @edge(() => ({
                nodeType: 'map',
                name: 'test'
            }) as any)
            map?: null;

            @edge(() => ({
                nodeType: 'list',
                name: 'test'
            }) as any)
            list?: null;

            @edge(() => ({
                nodeType: 'set',
                name: 'test'
            }) as any)
            set?: null;
        }
        let person = new Person();
        person = setupEdges(person);
        expect(person.single).toBeInstanceOf(SingleQuery);
        expect(person.map).toBeInstanceOf(MapQuery);
        expect(person.set).toBeInstanceOf(SetQuery);
        expect(person.list).toBeInstanceOf(ListQuery);
    });
});