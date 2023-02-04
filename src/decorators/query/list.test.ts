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


    it('should fetch all records', async () => {
        const mockGunResults = [
            {
                test: 'test1',
                _: {
                    '#': '0'
                }
            },
            {
                test: 'test2',
                _: {
                    '#': '1'
                }
            }
        ];
        
        const query = new ListQuery(mockParent, MockClass);
        query.fetchKeys = () => Promise.resolve({
            '0': {},
            '1': {}
        })
        query.listInstance = () => {
            return {
                map: () => ({
                    once: (fn) => {
                        mockGunResults.forEach((result) => {
                            fn(result, result['_']['#']);
                        })
                    }
                })
            }
        };

        const results = await query.fetchAll();

        results.forEach((result) => {
            expect(result).toBeInstanceOf(MockClass);
            expect(mockGunResults.some((x) => x._['#'] === result.gunId)).toBe(true);
        });
    });

    it('should fetch last index of the list', async () => {
        const query = new ListQuery(mockParent, MockClass);
        const mockGet = vi.fn(() => {
            return {
                then: () => Promise.resolve(5)
            }
        });
        query.listInstance = () => {
            return {
                get: mockGet 
            }
        };

        const index = await query.fetchLastIndex();
        
        expect(index).toBe(5);
        expect(mockGet).toBeCalledWith('lastIndex');
    });

    it('should fetch the current number of existing records', async () => {
        const query = new ListQuery(mockParent, MockClass);
        query.fetchKeys = () => Promise.resolve({
            '0': {},
            '1': {},
            '2': null,
            '3': {}
        });

        const length = await query.length();

        expect(length).toBe(3);
    });
    
    it('should fetch the next adjacent node', async () => {
        const query = new ListQuery(mockParent, MockClass);
        query.fetchLastIndex = () => Promise.resolve(3);
        query.fetchById = vi.fn((id) => {
            if (id === 2) return { gunId: 2 };
            return null;
        });

        const node = await query.fetchNext({ gunId: 1 });

        expect(query.fetchById).toHaveBeenCalledOnce();
        expect(node.gunId).toBe(2);
    });

    it('should not fetch the next adjacent node if the current node is the last record', async () => {
        const query = new ListQuery(mockParent, MockClass);
        query.fetchLastIndex = () => Promise.resolve(3);

        await expect(query.fetchNext({ gunId: 3 })).rejects.toThrowError('No next node');
    });

    it('should fetch the previous adjacent node', async () => {
        const query = new ListQuery(mockParent, MockClass);
        query.fetchLastIndex = () => Promise.resolve(3);
        query.fetchById = vi.fn((id) => {
            if (id === 1) return { gunId: 1 };
            return null;
        });

        const node = await query.fetchPrevious({ gunId: 2 });

        expect(query.fetchById).toHaveBeenCalledOnce();
        expect(node.gunId).toBe(1);
    });

    it('should not fetch the previous adjacent node', async () => {
        const query = new ListQuery(mockParent, MockClass);

        await expect(query.fetchPrevious({ gunId: 0 })).rejects.toThrowError('No previous node');
    });

    it('should fetch the first record', async () => {
        const query = new ListQuery(mockParent, MockClass);
        query.fetchById = vi.fn(() => Promise.resolve({ test: 'test'}));

        const result = await query.fetchFirst();

        expect(result).toEqual({
            test: 'test'
        });
        expect(query.fetchById).toBeCalledWith(0);
    });

    it('should fetch the last record', async () => {
        const query = new ListQuery(mockParent, MockClass);
        query.fetchLastIndex = () => Promise.resolve(3)
        query.fetchById = vi.fn(() => Promise.resolve({ test: 'test'}));

        const result = await query.fetchLast();

        expect(result).toEqual({
            test: 'test'
        });
        expect(query.fetchById).toBeCalledWith(3);
    });
});