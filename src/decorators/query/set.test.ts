import { describe, it, expect, vi } from 'vitest';
import { hydrateInstance } from '../field';
import { setupEdges } from '../edge';
import SetQuery from './set';

vi.mock('../field', () => {
    return {
        hydrateInstance: vi.fn((identity) => identity)
    };
});

vi.mock('../edge', () => {
    return {
        setupEdges: vi.fn((identity) => identity)
    };
});

const mockGetter = vi.fn(() => ({
    then: vi.fn(() => Promise.resolve({ test: 'test' }))
}));
const mockParent = {
    gunInstance: () => ({
        get: mockGetter
    })
};

class MockClass {
    gunId = null;
    parentNode = null;
    detached = null;

    static create(parent) {
        return {
            '_': {
                '#': 'souldid'
            }
        }
    }
}

describe('query/set', () => {
    it('should have a gun instance', () => {
        const query = new SetQuery(mockParent, MockClass);
        query.setInstance();
        expect(mockGetter).toHaveBeenCalledWith(MockClass.name.toLowerCase());
    });

    it('should throw error when parent does not gun instance', () => {
        const mockParent = {
            gunInstance: () => null
        };
        const query = new SetQuery(mockParent, MockClass);
        expect(() => { query.setInstance() }).toThrowError('No parent instance');
    });

    it('should fetch keys from a set', async () => {
        const query = new SetQuery(mockParent, MockClass);
        const keys = await query.fetchKeys();
        expect(keys).toEqual({ test: 'test' });
    });

    it('should fetch a record based on id', async () => {
        const mockParent = {
            gunInstance: () => ({
                get: () => ({
                    then: () => Promise.resolve({ test: 'test' })
                })
            })
        };
        const query = new SetQuery(mockParent, MockClass);
        const instance = await query.fetchById('souldid');
        expect(instance).toBeInstanceOf(MockClass);
        expect(instance.gunId).toEqual('souldid');
    });

    // it('should fetch a single node', async () => {
    //     const query = new ChildQuery(mockParent, MockClass);
    //     const instance = await query.fetch();
    //     expect(instance).toBeInstanceOf(MockClass);
    //     expect(instance.gunId).toBe(MockClass.name.toLowerCase());
    //     expect(instance.detached).toBe(true);
    //     expect(hydrateInstance).toBeCalledWith(instance, true);
    //     expect(setupEdges).toBeCalledWith(instance);
    // });

    // it('should not fetch a node when it does not exist in gun', async () => {
    //     const mockParent = {
    //         gunInstance: () => ({
    //             get: () => ({
    //                 then: () => Promise.resolve(null)
    //             })
    //         })
    //     };
    //     const query = new ChildQuery(mockParent, MockClass);
    //     const instance = await query.fetch();
    //     expect(instance).toBe(null);
    // });
});