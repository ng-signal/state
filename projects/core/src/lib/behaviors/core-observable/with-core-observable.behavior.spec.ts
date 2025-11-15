import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultBehaviorContext, NgVaultResourceStateError } from '@ngvault/shared';
import { flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { of, throwError } from 'rxjs';
import { withCoreObservableBehavior } from './with-core-observable.behavior';

interface TestModel {
  id: number;
  name: string;
}

describe('Behavior: withCoreObservableBehavior', () => {
  let injector: Injector;
  let mockBackend: HttpTestingController;
  let ctx: NgVaultBehaviorContext<TestModel[]>;
  let behavior: ReturnType<typeof withCoreObservableBehavior>;
  let httpClient: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    });

    injector = TestBed.inject(Injector);
    mockBackend = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    ctx = {
      isLoading: signal(false),
      error: signal<NgVaultResourceStateError | null>(null),
      value: signal<TestModel[] | undefined>(undefined)
    } as any;

    runInInjectionContext(injector, () => {
      behavior = withCoreObservableBehavior({ injector, behaviorId: 'test-id', type: 'state' } as any);
    });
  });

  afterEach(() => {
    mockBackend.verify();
  });

  it('should expose a fromObservable method', () => {
    const api = behavior?.extendCellAPI?.();
    expect(typeof api?.fromObservable).toBe('function');
  });

  it('should emit signals correctly for a successful Observable', async () => {
    const api = behavior?.extendCellAPI?.();
    const source$ = of([{ id: 1, name: 'Ada' }]);

    const result: any[] = [];

    api?.fromObservable(ctx, source$).subscribe(
      (res) => result.push(res),
      fail,
      async () => {
        expect(result.length).toBe(1);
        const snapshot = result[0];

        // Signals reflect the new value
        expect(snapshot.isLoading()).toBeFalse();
        expect(snapshot.value()).toEqual([{ id: 1, name: 'Ada' }]);
        expect(snapshot.error()).toBeNull();
        expect(snapshot.hasValue()).toBeTrue();

        // Lifecycle hooks fired in expected order
      }
    );

    await flushMicrotasksZoneless();
  });

  it('should handle error emission from the observable gracefully', async () => {
    const api = behavior?.extendCellAPI?.();
    const source$ = throwError(() => new Error('Boom!'));

    const result: any[] = [];
    let errValue: any;

    api?.fromObservable(ctx, source$).subscribe({
      next: (res) => result.push(res),
      error: (err) => (errValue = err)
    });

    await flushMicrotasksZoneless();

    expect(result.length).toBe(0);
    expect(errValue).toEqual(
      Object({
        message: 'Boom!',
        details: jasmine.any(String)
      })
    );
  });

  it('should properly emit state from a real HTTP observable', async () => {
    const api = behavior?.extendCellAPI?.();

    // Use native Angular http observable
    const source$ = httpClient.get('/api/data');

    const result: any[] = [];
    api?.fromObservable(ctx, source$).subscribe(
      (res) => result.push(res),
      fail,
      async () => {
        const snapshot = result[0];
        expect(snapshot.isLoading()).toBeFalse();
        expect(snapshot.value()).toEqual([{ id: 99, name: 'Alan' }]);
        expect(snapshot.error()).toBeNull();
        expect(snapshot.hasValue()).toBeTrue();
      }
    );

    const req = mockBackend.expectOne('/api/data');
    req.flush([{ id: 99, name: 'Alan' }]);

    await flushMicrotasksZoneless();
  });

  it('should capture HTTP errors reactively', async () => {
    const api = behavior?.extendCellAPI?.();
    const source$ = httpClient.get('/api/error');

    const result: any[] = [];
    let errValue: any;

    api?.fromObservable(ctx, source$).subscribe({
      next: (res) => result.push(res),
      error: (err) => (errValue = err)
    });

    const req = mockBackend.expectOne('/api/error');
    req.flush('Internal Error', { status: 500, statusText: 'Server Error' });

    await flushMicrotasksZoneless();

    expect(result.length).toBe(0);
    expect(errValue).toEqual({
      message: 'Http failure response for /api/error: 500 Server Error',
      status: 500,
      statusText: 'Server Error',
      details: 'Internal Error'
    });
  });
});
