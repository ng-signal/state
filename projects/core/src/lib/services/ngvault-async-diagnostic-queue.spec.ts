import { ApplicationRef, effect, Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { flushNgVaultQueue } from '@ngvault/testing';
import { NgVaultAsyncDiagnosticQueue } from './ngvault-async-diagnostic-queue';

describe('Queue: NgVaultAsyncDiagnostic', () => {
  let queue: NgVaultAsyncDiagnosticQueue;

  beforeEach(() => {
    queue = new NgVaultAsyncDiagnosticQueue();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), NgVaultAsyncDiagnosticQueue]
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
    expect(results).toEqual([]);

    await flushMicrotasks();

    await TestBed.inject(ApplicationRef).whenStable();

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
    expect(results).toEqual([]);

    await new Promise((r) => setTimeout(r, 10));

    expect(results).toEqual(['first', 'second']);
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
    expect(results).toEqual(['sync-1', 'async-2', 'sync-3']);
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
    expect(results).toEqual(['first', 'third', 'second']);
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

  it('should expose immutable frozen stats snapshots', () => {
    const stats = queue.stats;
    expect(Object.isFrozen(stats)).toBeTrue();
    expect(typeof stats.id).toBe('string');
    expect(stats.isRunning).toBeFalse();
    expect(stats.queued).toBe(0);
  });

  it('should update stats$ signal when queue changes', async () => {
    const changes: any[] = [];

    runInInjectionContext(TestBed.inject(Injector), () => {
      effect(() => {
        const s = queue.stats$();
        changes.push({ ...s });
      });
    });

    const initial = queue.stats;

    queue.enqueue(() => {}); // triggers signal update

    TestBed.tick();
    await flushNgVaultQueue(2);

    const after = queue.stats;

    expect(after.enqueuedTotal).toBe(initial.enqueuedTotal + 1);
    expect(after.queued).toBeGreaterThanOrEqual(0);

    // Verify reactive effect actually saw the update
    expect(changes.length).toBeGreaterThanOrEqual(2);
  });

  it('should emit "enqueue", "dequeue", and "processed" events via events$', async () => {
    const emitted: string[] = [];
    queue.events$.subscribe((e) => emitted.push(e.type));

    queue.enqueue(() => {}); // enqueue → dequeue → processed

    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(emitted).toContain('enqueue');
    expect(emitted).toContain('dequeue');
    expect(emitted).toContain('processed');
  });

  it('should emit "error" event when a task throws', async () => {
    const emitted: any[] = [];

    queue.events$.subscribe((e) => emitted.push(e));

    queue.enqueue(() => {
      throw new Error('boom');
    });

    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    const errorEvent = emitted.find((e) => e.type === 'error');
    expect(errorEvent).toBeDefined();
    expect(errorEvent.error).toEqual(jasmine.any(Error));
  });

  it('should do nothing if dequeue is called with empty queue', async () => {
    // @ts-expect-error accessing private method for edge case
    await queue['#dequeue']?.();
    const stats = queue.stats;
    expect(stats.isRunning).toBeFalse();
    expect(stats.queued).toBe(0);
  });

  it('should correctly increment processed and enqueue counters over multiple cycles', async () => {
    queue.enqueue(() => {});
    queue.enqueue(() => {});
    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    const stats1 = queue.stats;
    expect(stats1.enqueuedTotal).toBe(2);
    expect(stats1.processedTotal).toBe(2);

    queue.enqueue(() => {});
    await flushMicrotasks();
    await TestBed.inject(ApplicationRef).whenStable();

    const stats2 = queue.stats;
    expect(stats2.enqueuedTotal).toBe(3);
    expect(stats2.processedTotal).toBe(3);
  });
});
