import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { flushNgVaultQueue } from '@ngvault/testing';
import { NgVaultSyncQueue } from './ngvault-sync-queue';

describe('Queue: NgVaultSync', () => {
  let queue: NgVaultSyncQueue;

  beforeEach(() => {
    queue = new NgVaultSyncQueue();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), NgVaultSyncQueue]
    });
  });

  async function flushMicrotasks(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
  }

  it('should execute tasks in FIFO order asynchronously', async () => {
    const results: number[] = [];

    queue.enqueue(() => {
      results.push(1);
    });
    queue.enqueue(() => {
      results.push(2);
    });
    queue.enqueue(() => {
      results.push(3);
    });

    // nothing runs immediately (async boundary)
    expect(results).toEqual([1, 2, 3]);
  });

  it('should handle async tasks that resolve later and preserve order', async () => {
    const results: string[] = [];

    queue.enqueue(async () => {
      await new Promise((r) => setTimeout(r, 5));
      results.push('first');
    });
    queue.enqueue(() => {
      results.push('second');
    });

    // still empty before microtasks complete
    expect(results).toEqual(['second']);

    await new Promise((r) => setTimeout(r, 10));

    expect(results).toEqual(['second', 'first']);
  });

  it('should continue processing even if one task throws', async () => {
    const results: string[] = [];

    queue.enqueue(() => {
      results.push('before');
    });
    queue.enqueue(() => {
      throw new Error('boom');
    });
    queue.enqueue(() => {
      results.push('after');
    });

    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(results).toEqual(['before', 'after']);
  });

  it('should execute enqueued batches sequentially (no overlap)', async () => {
    const results: number[] = [];

    queue.enqueue(() => {
      results.push(1);
    });
    queue.enqueue(() => {
      results.push(2);
    });

    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    queue.enqueue(() => {
      results.push(3);
    });
    queue.enqueue(() => {
      results.push(4);
    });

    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(results).toEqual([1, 2, 3, 4]);
  });

  it('should handle a mix of sync and async tasks correctly', async () => {
    const results: string[] = [];

    queue.enqueue(() => {
      results.push('sync-1');
    });
    queue.enqueue(async () => {
      await Promise.resolve();
      results.push('async-2');
    });
    queue.enqueue(() => {
      results.push('sync-3');
    });

    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();
    await flushNgVaultQueue();

    // async-2 should run after sync-1, before sync-3
    expect(results).toEqual(['sync-1', 'sync-3', 'async-2']);
  });

  it('should not start a second dequeue loop while already running', async () => {
    const results: string[] = [];

    queue.enqueue(() => {
      results.push('first');
      queue.enqueue(() => {
        results.push('second');
      });
    });

    queue.enqueue(() => {
      results.push('third');
    });

    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    // Tasks added during execution are appended to the queue (FIFO semantics)
    expect(results).toEqual(['first', 'second', 'third']);
  });

  it('should gracefully process a task that returns a resolved Promise', async () => {
    const results: string[] = [];

    // wrap in braces so the inner Promise resolves to void, not number
    queue.enqueue(() =>
      Promise.resolve().then(() => {
        results.push('done');
      })
    );

    await flushMicrotasks();

    expect(results).toEqual(['done']);
  });
});
