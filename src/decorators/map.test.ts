import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';
import mapMixin from './mixins/map';
import baseMixin from "./mixins/base";
import linkMixin, { mapLinkMixin } from "./mixins/link";
import { setupEdges } from "./edge";
import map from "./map";

vi.mock('./mixins/map', () => {
    return {
        default: vi.fn(),
    }
});

vi.mock('./mixins/base', () => {
    return {
        default: vi.fn(),
    }
});

vi.mock('./mixins/link', () => {
    return {
        default: vi.fn(),
        mapLinkMixin: vi.fn(),
    }
});

vi.mock('./edge', () => {
    return {
        setupEdges: vi.fn((identity) => identity)
    }
});

describe('map', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be able to link to other entity', () => {
        @map
        class Person {}

        expect(linkMixin).toBeCalledWith(Person);      
    });

    it('should be able to link the parent entity to other entity', () => {
        @map
        class Person {}

        expect(mapLinkMixin).toBeCalledWith(Person);      
    });

    it('should have methods and properties for a map node', () => {
        @map
        class Person {}

        expect(mapMixin).toBeCalledWith(Person); 
    });

    it('should have methods and properties for a generic node', () => {
        @map
        class Person {}

        expect(baseMixin).toBeCalledWith(Person); 
    });

    it('should be able to create a node', () => {
        @map
        class Person {
            initMapDefaults = vi.fn();
        }

        const mockGunNode = { test: 'test' };
        const instance = Person.create(mockGunNode, 'idtest');

        expect(instance.initMapDefaults).toBeCalled();
        expect(instance.gunId).toBe('idtest');
        expect(instance.mapId).toBe(Person.name.toLowerCase());
        expect(instance.parentNode).toEqual(mockGunNode);
        expect(setupEdges).toBeCalledWith(instance);
        expect(instance).toBeInstanceOf(Person);
    });

    it('should not be able to create a node when no id is provided', () => {
        @map
        class Person {
            initMapDefaults = vi.fn();
        }

        const mockGunNode = { test: 'test' };
        expect(() => {
            Person.create(mockGunNode);
        }).toThrowError('id is required');
    });
});