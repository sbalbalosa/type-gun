import { describe, it, expect, vi } from 'vitest';
import 'reflect-metadata';
import SingleQuery from './single';
import { hydrateInstance } from '../field';

vi.mock('../field', () => {
    return {
        hydrateInstance: vi.fn(() => true)
    };
});

const mockGetter = vi.fn(() => ({
    then: vi.fn(() => Promise.resolve(true))
}));
const mockParent = {
    gunInstance: () => ({
        get: mockGetter
    })
};

const mockTargetObject = { test: 'test' };
const mockCreate = vi.fn(() => mockTargetObject);
const mockTarget = {
    name: 'test',
    create: mockCreate
};

describe('query/single', () => {
    it('should have a gun instance', () => {
        const query = new SingleQuery(mockParent, mockTarget);
        query.gunInstance();
        expect(mockGetter).toHaveBeenCalledWith(mockTarget.name);
    });

    it('should throw error when parent does not gun instance', () => {
        const mockParent = {
            gunInstance: () => null
        };
        const query = new SingleQuery(mockParent, mockTarget);
        expect(() => { query.gunInstance() }).toThrowError('No parent instance');
    });

    it('should fetch a single node', async () => {
        const query = new SingleQuery(mockParent, mockTarget);
        const instance = await query.fetch();
        expect(hydrateInstance).toBeCalledWith(mockTargetObject, true);
        expect(mockGetter).toHaveBeenCalledWith(mockTarget.name);
        expect(instance).toBe(true);
    });

    it('should not fetch a node when it does not exist in gun', async () => {
        const mockParent = {
            gunInstance: () => ({
                get: () => ({
                    then: () => Promise.resolve(null)
                })
            })
        };
        const query = new SingleQuery(mockParent, mockTarget);
        const instance = await query.fetch();
        expect(instance).toBe(null);
    });
});