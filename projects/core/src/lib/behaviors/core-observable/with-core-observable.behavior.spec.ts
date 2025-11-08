import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ResourceStateError, VaultBehaviorContext } from '@ngvault/shared';
import { provideVaultTesting } from '@ngvault/testing';
import { of, throwError } from 'rxjs';
import { withCoreObservableBehavior } from './with-core-observable.behavior';

interface TestModel {
  id: number;
  name: string;
}

describe('Behavior: withCoreObservableBehavior', () => {
  let injector: Injector;
  let mockBackend: HttpTestingController;
  let ctx: VaultBehaviorContext<TestModel[]>;
  let behavior: ReturnType<typeof withCoreObservableBehavior>;
  let key = 'NgVault::Core::FromObservable';
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
      error: signal<ResourceStateError | null>(null),
      value: signal<TestModel[] | undefined>(undefined),
      behaviorRunner: {
        onLoad: jasmine.createSpy('onLoad'),
        onSet: jasmine.createSpy('onSet'),
        onError: jasmine.createSpy('onError'),
        onDispose: jasmine.createSpy('onDispose')
      }
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
    const ctx = {
      behaviorRunner: {
        onInit: jasmine.createSpy('onInit')
      }
    } as any;

    behavior.onInit('fake-key', 'fake-service', ctx);

    expect(ctx.behaviorRunner!.onInit).toHaveBeenCalledWith(
      'test-id',
      'NgVault::Core::FromObservable',
      'fake-service',
      jasmine.any(Object)
    );
  });

  it('should emit signals correctly for a successful Observable', async () => {
    const api = behavior?.extendCellAPI?.();
    const source$ = of([{ id: 1, name: 'Ada' }]);

    const result: any[] = [];

    api?.fromObservable(key, ctx, source$).subscribe(
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

    await TestBed.inject(ApplicationRef).whenStable();
    expect(ctx.behaviorRunner!.onLoad).toHaveBeenCalledWith('test-id', key, ctx);
    expect(ctx.behaviorRunner!.onSet).toHaveBeenCalledWith('test-id', key, ctx);
    expect(ctx.behaviorRunner!.onDispose).toHaveBeenCalledWith('test-id', key, ctx);
  });

  it('should handle error emission from the observable gracefully', async () => {
    const api = behavior?.extendCellAPI?.();
    const source$ = throwError(() => new Error('Boom!'));

    const result: any[] = [];
    let errValue: any;

    api?.fromObservable(key, ctx, source$).subscribe({
      next: (res) => result.push(res),
      error: (err) => (errValue = err)
    });

    await TestBed.inject(ApplicationRef).whenStable();

    expect(result.length).toBe(0);
    expect(errValue).toEqual(
      Object({
        message: 'Boom!',
        details: jasmine.any(String)
      })
    );
    expect(ctx.behaviorRunner!.onError).toHaveBeenCalledWith('test-id', key, ctx);
    expect(ctx.behaviorRunner!.onDispose).not.toHaveBeenCalled();
  });

  it('should properly emit state from a real HTTP observable', async () => {
    const api = behavior?.extendCellAPI?.();

    // Use native Angular http observable
    const source$ = httpClient.get('/api/data');

    const result: any[] = [];
    api?.fromObservable(key, ctx, source$).subscribe(
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

    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.behaviorRunner!.onSet).toHaveBeenCalled();
    expect(ctx.behaviorRunner!.onDispose).toHaveBeenCalled();
  });

  it('should capture HTTP errors reactively', async () => {
    const api = behavior?.extendCellAPI?.();
    const source$ = httpClient.get('/api/error');

    const result: any[] = [];
    let errValue: any;

    api?.fromObservable(key, ctx, source$).subscribe({
      next: (res) => result.push(res),
      error: (err) => (errValue = err)
    });

    const req = mockBackend.expectOne('/api/error');
    req.flush('Internal Error', { status: 500, statusText: 'Server Error' });

    await TestBed.inject(ApplicationRef).whenStable();

    expect(result.length).toBe(0);
    expect(errValue).toEqual({
      message: 'Http failure response for /api/error: 500 Server Error',
      status: 500,
      statusText: 'Server Error',
      details: 'Internal Error'
    });
    expect(ctx.behaviorRunner!.onError).toHaveBeenCalledWith('test-id', key, ctx);
  });
});
