import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';
import singleMixin from './mixins/single';
import baseMixin from "./mixins/base";
import linkMixin from "./mixins/link";
import { setupEdges } from "./edge";
import node from "./node";

vi.mock('./mixins/single', () => {
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
    }
});

vi.mock('./edge', () => {
    return {
        setupEdges: vi.fn((identity) => identity)
    }
});

describe('node', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be able to link to other entity', () => {
        @node
        class Person {}

        expect(linkMixin).toBeCalledWith(Person);      
    });

    it('should have methods and properties for a single node', () => {
        @node
        class Person {}

        expect(singleMixin).toBeCalledWith(Person); 
    });

    it('should have methods and properties for a generic node', () => {
        @node
        class Person {}

        expect(baseMixin).toBeCalledWith(Person); 
    });

    it('should be able to create a node', () => {
        @node
        class Person {
            initSingleDefaults = vi.fn();
        }

        const mockGunNode = { test: 'parent' };
        const instance = Person.create(mockGunNode);

        expect(instance.initSingleDefaults).toBeCalled();
        expect(instance.parentNode).toEqual(mockGunNode);
        expect(instance.gunId).toBe(Person.name.toLowerCase());
        expect(setupEdges).toBeCalledWith(instance);
        expect(instance).toBeInstanceOf(Person);
    })
});