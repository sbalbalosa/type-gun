
import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'reflect-metadata';
import listMixin from './mixins/list';
import baseMixin from "./mixins/base";
import linkMixin, { listLinkMixin } from "./mixins/link";
import { setupEdges } from "./edge";
import list from "./list";

vi.mock('./mixins/list', () => {
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
        listLinkMixin: vi.fn(),
    }
});

vi.mock('./edge', () => {
    return {
        setupEdges: vi.fn((identity) => identity)
    }
});

describe('list', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be able to link to other entity', () => {
        @list
        class Person {}

        expect(linkMixin).toBeCalledWith(Person);      
    });

    it('should be able to link the parent entity to other entity', () => {
        @list
        class Person {}

        expect(listLinkMixin).toBeCalledWith(Person);      
    });

    it('should have methods and properties for a list node', () => {
        @list
        class Person {}

        expect(listMixin).toBeCalledWith(Person); 
    });

    it('should have methods and properties for a generic node', () => {
        @list
        class Person {}

        expect(baseMixin).toBeCalledWith(Person); 
    });

    it('should be able to create a node', () => {
        @list
        class Person {
            initListDefaults = vi.fn();
        }

        const mockGunNode = { test: 'test' };
        const instance = Person.create(mockGunNode, 1);

        expect(instance.initListDefaults).toBeCalled();
        expect(instance.gunId).toBe(1);
        expect(instance.listId).toBe(Person.name.toLowerCase());
        expect(instance.parentNode).toEqual(mockGunNode);
        expect(setupEdges).toBeCalledWith(instance);
        expect(instance).toBeInstanceOf(Person);
    });
});