import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';
import multipleMixin from './mixins/multiple';
import baseMixin from "./mixins/base";
import linkMixin, { setLinkMixin } from "./mixins/link";
import { setupEdges } from "./edge";
import set from "./set";

vi.mock('./mixins/multiple', () => {
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
        setLinkMixin: vi.fn(),
    }
});

vi.mock('./edge', () => {
    return {
        setupEdges: vi.fn((identity) => identity)
    }
});

describe('set', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be able to link to other entity', () => {
        @set
        class Person {}

        expect(linkMixin).toBeCalledWith(Person);      
    });

    it('should be able to link the parent entity to other entity', () => {
        @set
        class Person {}

        expect(setLinkMixin).toBeCalledWith(Person);      
    });

    it('should have methods and properties for a multiple node', () => {
        @set
        class Person {}

        expect(multipleMixin).toBeCalledWith(Person); 
    });

    it('should have methods and properties for a generic node', () => {
        @set
        class Person {}

        expect(baseMixin).toBeCalledWith(Person); 
    });

    it('should be able to create a node', () => {
        @set
        class Person {
            initSetDefaults = vi.fn();
        }

        const mockGunNode = { test: 'test' };
        const instance = Person.create(mockGunNode);

        expect(instance.initSetDefaults).toBeCalled();
        expect(instance.gunId).toBe(null);
        expect(instance.setId).toBe(Person.name.toLowerCase());
        expect(instance.parentNode).toEqual(mockGunNode);
        expect(setupEdges).toBeCalledWith(instance);
        expect(instance).toBeInstanceOf(Person);
    })
});