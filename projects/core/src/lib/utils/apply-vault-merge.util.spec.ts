import { applyNgVaultValueMerge } from './apply-vault-merge.util';

describe('Utility: applyVaultValueMerge', () => {
  it('should safely do nothing when ctx is undefined', () => {
    expect(() => applyNgVaultValueMerge([1], [2])).not.toThrow();
  });

  it('should safely do nothing when next is undefined', () => {
    const curr = [1, 2, 3];
    expect(applyNgVaultValueMerge(curr, undefined)).toEqual([1, 2, 3]);
  });

  it('should safely when next and curr is undefined', () => {
    expect(applyNgVaultValueMerge(undefined, undefined)).toBeUndefined();
  });

  describe('Arrays', () => {
    it('should append arrays together', () => {
      const curr = [1, 2];
      const next = [3, 4];
      expect(applyNgVaultValueMerge(curr, next)).toEqual([3, 4]);
    });

    it('should not mutate original arrays', () => {
      const curr = [1, 2];
      const next = [3];
      expect(applyNgVaultValueMerge(curr, next)).toEqual([3]);
      expect(curr).toEqual([1, 2]);
    });

    it('should handle empty arrays', () => {
      const curr: any[] = [];
      const next: any[] = [];
      expect(applyNgVaultValueMerge(curr, next)).toEqual([]);
    });
  });

  describe('Objects', () => {
    it('should shallow merge plain objects', () => {
      const curr = { a: 1, b: 2 };
      const next = { b: 3, c: 4 };
      expect(applyNgVaultValueMerge(curr, next as any)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should replace nested object reference (shallow merge only)', () => {
      const curr = { deep: { one: 1 } };
      const next = { deep: { two: 2 } };
      expect(applyNgVaultValueMerge(curr, next as any)).toEqual({ deep: { two: 2 } });
    });

    it('should preserve immutability', () => {
      const curr = { name: 'Ada' };
      const next = { age: 35 } as any;
      expect(applyNgVaultValueMerge(curr, next)).toEqual({ name: 'Ada', age: 35 });
      expect(curr).toEqual({ name: 'Ada' });
    });

    it('should handle empty objects gracefully', () => {
      const curr = {};
      const next = {};
      expect(applyNgVaultValueMerge(curr, next)).toEqual({});
    });
  });

  describe('Mixed-type replacements', () => {
    it('should replace object with array', () => {
      const curr = { a: 1 };
      const next = [1, 2] as any;
      expect(applyNgVaultValueMerge(curr, next)).toEqual([1, 2]);
    });

    it('should replace array with object', () => {
      const curr = [1, 2];
      const next = { a: 1 } as any;
      expect(applyNgVaultValueMerge(curr, next)).toEqual({ a: 1 });
    });

    it('should replace primitive with array', () => {
      expect(applyNgVaultValueMerge(42, [7, 8] as any)).toEqual([7, 8]);
    });

    it('should replace primitive with object', () => {
      expect(applyNgVaultValueMerge('test', { val: 123 } as any)).toEqual({ val: 123 });
    });
  });

  describe('Primitives', () => {
    it('should replace primitive values (number)', () => {
      expect(applyNgVaultValueMerge(1, 2)).toBe(2);
    });

    it('should replace string values', () => {
      expect(applyNgVaultValueMerge('foo', 'bar')).toBe('bar');
    });

    it('should replace boolean values', () => {
      expect(applyNgVaultValueMerge(false, true)).toBeTrue();
    });
  });

  describe('Edge cases', () => {
    it('should handle null current and valid next', () => {
      expect(applyNgVaultValueMerge(null, { name: 'Ada' })).toEqual({ name: 'Ada' });
    });

    it('should handle null next', () => {
      expect(applyNgVaultValueMerge({ test: 1 }, null)).toBeNull();
    });

    it('should handle NaN gracefully', () => {
      expect(applyNgVaultValueMerge(NaN, 42)).toBe(42);
    });

    it('should handle deeply nested arrays without merging inner levels', () => {
      const curr = [[1, 2]];
      const next = [[3]];
      expect(applyNgVaultValueMerge(curr, next)).toEqual([[3]]);
    });

    it('should handle symbolic and unexpected types gracefully', () => {
      const sym = Symbol('test');
      expect(() => applyNgVaultValueMerge(sym as any, 'value')).not.toThrow();
    });
  });

  describe('Object shallow merge line coverage', () => {
    it('should merge two simple objects and override overlapping keys', () => {
      const curr = { id: 1, name: 'Ada' };
      const next = { name: 'Lovelace', age: 36 } as any;
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual({ id: 1, name: 'Lovelace', age: 36 });
    });

    it('should preserve reference immutability (return new object)', () => {
      const curr = { x: 1 };
      const next = { y: 2 } as any;
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).not.toBe(curr);
      expect(result).not.toBe(next);
      expect(result).toEqual({ x: 1, y: 2 });
    });

    it('should ignore null values safely when merging', () => {
      const curr = { id: 1 };
      const next = null as any;
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toBeNull();
    });

    it('should merge even if current is null (use next)', () => {
      const curr = null;
      const next = { key: 'value' };
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual({ key: 'value' });
    });

    it('should not throw when merging objects containing functions', () => {
      const curr = { fn: () => 1 };
      const next = { name: 'test' } as any;
      expect(() => applyNgVaultValueMerge(curr, next)).not.toThrow();
    });

    it('should merge symbol-keyed properties without error', () => {
      const sym = Symbol('secret');
      const curr = { id: 1, [sym]: 'hidden' };
      const next = { active: true } as any;
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual(jasmine.objectContaining({ id: 1, active: true }));
    });

    it('should handle nested objects by shallow replacement (not deep merge)', () => {
      const curr = { meta: { old: true, keep: 1 } };
      const next = { meta: { new: true } } as any;
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual({ meta: { new: true } });
      expect(result.meta).not.toBe(curr.meta);
    });

    it('should not modify input objects during merge', () => {
      const curr = { a: 1 };
      const next = { b: 2 } as any;
      const snapshotCurr = { ...curr };
      const snapshotNext = { ...next };
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual({ a: 1, b: 2 });
      expect(curr).toEqual(snapshotCurr);
      expect(next).toEqual(snapshotNext);
    });

    it('should merge empty objects safely', () => {
      const curr = {};
      const next = {};
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual({});
    });

    it('should handle objects with undefined properties correctly', () => {
      const curr = { id: 1, name: undefined };
      const next = { name: 'Ada' } as any;
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual({ id: 1, name: 'Ada' });
    });

    it('should skip merge when curr is object but next is primitive (fails typeof next check)', () => {
      const curr = { a: 1 };
      const next = 42 as any; // not an object
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toBe(42); // falls through to final return
    });

    it('should skip merge when next is object but curr is primitive (fails typeof curr check)', () => {
      const curr = 'string' as any; // not an object
      const next = { a: 1 };
      const result = applyNgVaultValueMerge(curr, next);
      expect(result).toEqual({ a: 1 }); // also falls through to final return
    });
  });
});
