import { describe, it, expect, vi } from 'vitest';
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

    static create() {
        return new MockClass();
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
                    get: () => Promise.resolve({ test: 'test', _: { '#': 'soulid' } })
                })
            })
        };
        const query = new SetQuery(mockParent, MockClass);

        const instance = await query.fetchById('souldid');

        expect(instance).toBeInstanceOf(MockClass);
        expect(instance.gunId).toBe('soulid');
    });

    it('should not fetch a record if it does not exist in gun', async () => {
        const mockParent = {
            gunInstance: () => ({
                get: () => ({
                    get: () => Promise.resolve(null)
                })
            })
        };
        const query = new SetQuery(mockParent, MockClass);

        const result = await query.fetchById('test');

        expect(result).toBe(null);
    });

    it('should fetch all records', async () => {
        const mockGunResults = [
            {
                test: 'test1',
                _: {
                    '#': 'test1'
                }
            },
            {
                test: 'test2',
                _: {
                    '#': 'test2'
                }
            }
        ];
        class MockClass {
            gunId = null;
            parentNode = null;
            detached = null;
            static create() {
                return new MockClass();
            }
        }
        const query = new SetQuery(mockParent, MockClass);
        query.fetchKeys = () => Promise.resolve({
            test1: {},
            test2: {}
        })
        query.setInstance = () => {
            return {
                once: () => ({
                    map: () => ({
                        once: (fn) => {
                            mockGunResults.forEach((result) => {
                                fn(result, result['_']['#']);
                            })
                        }
                    })
                })
            }
        };

        const results = await query.fetchAll();

        results.forEach((result) => {
            expect(result).toBeInstanceOf(MockClass);
            expect(mockGunResults.some((x) => x._['#'] === result.gunId)).toBe(true);
        });
    });

    it('should not fetch records if it does not exist in gun', async () => {
        const query = new SetQuery(mockParent, MockClass);
        query.fetchKeys = () => Promise.resolve({});
        const results = await query.fetchAll();
        expect(results.length).toBe(0);
    });
});