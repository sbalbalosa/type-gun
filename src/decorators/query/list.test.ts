import { describe, it, expect, vi } from 'vitest';
import ListQuery from './list';

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

    static create() {
        return new MockClass();
    }
}

describe('query/list', () => {
    it('should have a gun instance', () => {
        const query = new ListQuery(mockParent, MockClass);

        query.listInstance();

        expect(mockGetter).toHaveBeenCalledWith(MockClass.name.toLowerCase());
    });

    it('should have a gun instance with a custom name', () => {
        const query = new ListQuery(mockParent, MockClass, 'custom');

        query.listInstance();

        expect(mockGetter).toHaveBeenCalledWith('custom');
    });

    it('should throw error when parent does not gun instance', () => {
        const mockParent = {
            gunInstance: () => null
        };

        const query = new ListQuery(mockParent, MockClass);

        expect(() => { query.listInstance() }).toThrowError('No parent instance');
    });
    
    it('should fetch a record based on id', async () => {
        const query = new ListQuery({}, MockClass);
        query.listInstance = () => ({
            get: () => ({
                then: () => Promise.resolve({ test: 'test' })
            })
        });

        const instance = await query.fetchById(1);

        expect(instance).toBeInstanceOf(MockClass);
        expect(instance.gunId).toBe(1);
    });

    it('should check if list in gun exist', async () => {
        const query = new ListQuery({}, MockClass);
        query.listInstance = () => ({
            then: () => Promise.resolve({ test: 'test' })
        });

        const result = await query.isExist();

        expect(result).toBe(true);
    });

    it('should check if list in gun do not exist', async () => {
        const query = new ListQuery({}, MockClass);
        query.listInstance = () => ({
            then: () => Promise.resolve(null)
        });

        const result = await query.isExist();

        expect(result).toBe(false);
    });


    // it('should fetch all records', async () => {
    //     const mockGunResults = [
    //         {
    //             test: 'test1',
    //             _: {
    //                 '#': 'test1'
    //             }
    //         },
    //         {
    //             test: 'test2',
    //             _: {
    //                 '#': 'test2'
    //             }
    //         }
    //     ];
        
    //     const query = new ListQuery(mockParent, MockClass);
    //     query.fetchKeys = () => Promise.resolve({
    //         test1: {},
    //         test2: {}
    //     })
    //     query.setInstance = () => {
    //         return {
    //             once: () => ({
    //                 map: () => ({
    //                     once: (fn) => {
    //                         mockGunResults.forEach((result) => {
    //                             fn(result, result['_']['#']);
    //                         })
    //                     }
    //                 })
    //             })
    //         }
    //     };

    //     const results = await query.fetchAll();

    //     results.forEach((result) => {
    //         expect(result).toBeInstanceOf(MockClass);
    //         expect(mockGunResults.some((x) => x._['#'] === result.gunId)).toBe(true);
    //     });
    // });

    // it('should not fetch records if it does not exist in gun', async () => {
    //     const query = new ListQuery(mockParent, MockClass);
    //     query.fetchKeys = () => Promise.resolve({});
    //     const results = await query.fetchAll();
    //     expect(results.length).toBe(0);
    // });
});