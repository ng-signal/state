import { signal } from '@angular/core';
import { applyNgVaultValueMerge } from './apply-vault-merge.util';

describe('Utility: applyVaultValueMerge', () => {
  let ctx: any;

  beforeEach(() => {
    ctx = {
      value: Object.assign(signal(undefined), {
        set(v: any) {
          (ctx.value as any).stored = v;
        },
        call() {
          return (ctx.value as any).stored;
        }
      }) as any
    };
  });

  it('should safely do nothing when ctx is undefined', () => {
    expect(() => applyNgVaultValueMerge(undefined as any, [1], [2])).not.toThrow();
  });

  it('should safely do nothing when ctx.value is undefined', () => {
    const badCtx = { value: undefined } as any;
    expect(() => applyNgVaultValueMerge(badCtx, [1], [2])).not.toThrow();
  });

  it('should safely do nothing when next is undefined', () => {
    const curr = [1, 2, 3];
    applyNgVaultValueMerge(ctx, curr, undefined);
    expect((ctx.value as any).stored).toBeUndefined();
  });

  describe('Arrays', () => {
    it('should append arrays together', () => {
      const curr = [1, 2];
      const next = [3, 4];
      applyNgVaultValueMerge(ctx, curr, next);
      expect((ctx.value as any).stored).toEqual([3, 4]);
    });

    it('should not mutate original arrays', () => {
      const curr = [1, 2];
      const next = [3];
      applyNgVaultValueMerge(ctx, curr, next);
      const result = (ctx.value as any).stored;
      expect(result).not.toBe(curr);
      expect(curr).toEqual([1, 2]);
    });

    it('should handle empty arrays', () => {
      const curr: any[] = [];
      const next: any[] = [];
      applyNgVaultValueMerge(ctx, curr, next);
      expect((ctx.value as any).stored).toEqual([]);
    });
  });

  describe('Objects', () => {
    it('should shallow merge plain objects', () => {
      const curr = { a: 1, b: 2 };
      const next = { b: 3, c: 4 };
      applyNgVaultValueMerge(ctx, curr, next as any);
      expect((ctx.value as any).stored).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should replace nested object reference (shallow merge only)', () => {
      const curr = { deep: { one: 1 } };
      const next = { deep: { two: 2 } };
      applyNgVaultValueMerge(ctx, curr, next as any);
      expect((ctx.value as any).stored).toEqual({ deep: { two: 2 } });
    });

    it('should preserve immutability', () => {
      const curr = { name: 'Ada' };
      const next = { age: 35 } as any;
      applyNgVaultValueMerge(ctx, curr, next);
      const result = (ctx.value as any).stored;
      expect(result).not.toBe(curr);
      expect(result).toEqual({ name: 'Ada', age: 35 });
    });

    it('should handle empty objects gracefully', () => {
      const curr = {};
      const next = {};
      applyNgVaultValueMerge(ctx, curr, next);
      expect((ctx.value as any).stored).toEqual({});
    });
  });

  describe('Mixed-type replacements', () => {
    it('should replace object with array', () => {
      const curr = { a: 1 };
      const next = [1, 2] as any;
      applyNgVaultValueMerge(ctx, curr, next);
      expect((ctx.value as any).stored).toEqual([1, 2]);
    });

    it('should replace array with object', () => {
      const curr = [1, 2];
      const next = { a: 1 } as any;
      applyNgVaultValueMerge(ctx, curr, next);
      expect((ctx.value as any).stored).toEqual({ a: 1 });
    });

    it('should replace primitive with array', () => {
      applyNgVaultValueMerge(ctx, 42, [7, 8] as any);
      expect((ctx.value as any).stored).toEqual([7, 8]);
    });

    it('should replace primitive with object', () => {
      applyNgVaultValueMerge(ctx, 'test', { val: 123 } as any);
      expect((ctx.value as any).stored).toEqual({ val: 123 });
    });
  });

  describe('Primitives', () => {
    it('should replace primitive values (number)', () => {
      applyNgVaultValueMerge(ctx, 1, 2);
      expect((ctx.value as any).stored).toBe(2);
    });

    it('should replace string values', () => {
      applyNgVaultValueMerge(ctx, 'foo', 'bar');
      expect((ctx.value as any).stored).toBe('bar');
    });

    it('should replace boolean values', () => {
      applyNgVaultValueMerge(ctx, false, true);
      expect((ctx.value as any).stored).toBeTrue();
    });
  });

  describe('Edge cases', () => {
    it('should handle null current and valid next', () => {
      applyNgVaultValueMerge(ctx, null, { name: 'Ada' });
      expect((ctx.value as any).stored).toEqual({ name: 'Ada' });
    });

    it('should handle null next', () => {
      applyNgVaultValueMerge(ctx, { test: 1 }, null);
      expect((ctx.value as any).stored).toBeNull();
    });

    it('should handle NaN gracefully', () => {
      applyNgVaultValueMerge(ctx, NaN, 42);
      expect((ctx.value as any).stored).toBe(42);
    });

    it('should handle deeply nested arrays without merging inner levels', () => {
      const curr = [[1, 2]];
      const next = [[3]];
      applyNgVaultValueMerge(ctx, curr, next);
      expect((ctx.value as any).stored).toEqual([[3]]);
    });

    it('should handle symbolic and unexpected types gracefully', () => {
      const sym = Symbol('test');
      expect(() => applyNgVaultValueMerge(ctx, sym as any, 'value')).not.toThrow();
    });
  });
});
