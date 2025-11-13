import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultFeatureCell, VaultSignalRef } from '@ngvault/shared';
import { createTestEventListener, flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { Subject } from 'rxjs';
import { provideFeatureCell } from './provide-feature-cell';

interface TestModel {
  id: number;
  name: string;
}

describe('Provider: Feature Cell: fromObservable', () => {
  let vault: NgVaultFeatureCell<TestModel[] | TestModel>;
  let subject: Subject<TestModel[]>;
  const calls: any = [];
  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeEach(() => {
    subject = new Subject<TestModel[]>();
    calls.length = 0;

    TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    });

    const injector = TestBed.inject(Injector);
    const providers = provideFeatureCell(class TestService {}, { key: 'http', initial: [], insights: {} as any }, []);
    const vaultFactory = (providers[0] as any).useFactory;

    runInInjectionContext(injector, () => {
      vault = vaultFactory();
    });
    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
  });

  it('should set state fully with replaceState()', async () => {
    const initial = vault.state.value();
    expect(initial).toEqual([]);

    const newData = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ];
    vault.replaceState({ loading: true });
    TestBed.tick();
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeFalse();

    vault.replaceState({ value: newData });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual(newData);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    vault.replaceState({ value: newData, loading: false, error: { message: 'oops' } });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual(newData);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toEqual(Object({ message: 'oops' }));
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should replace array when mergeState() is called with array data', async () => {
    vault.replaceState({ value: [{ id: 1, name: 'Ada' }] });
    await flushMicrotasksZoneless();
    expect(vault.state.hasValue()).toBeTrue();
    vault.mergeState({ value: [{ id: 2, name: 'Grace' }] });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual([{ id: 2, name: 'Grace' }]);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should shallow merge objects when mergeState() is called with object data', async () => {
    const providers = provideFeatureCell(class ObjService {}, { key: 'obj', initial: { id: 1, name: 'Ada' } });

    const provider = providers.find((p: any) => typeof p.useFactory === 'function');

    let vault!: NgVaultFeatureCell<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.mergeState({ value: { name: 'Grace' } as any });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual({ id: 1, name: 'Grace' });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should return independent ResourceSignal when fromObservable() succeeds', () => {
    const resource = {
      loading: signal<boolean>(false),
      value: signal<any | undefined>(undefined),
      error: signal<any | null>(null)
    };

    vault.fromObservable!(subject.asObservable()).subscribe({
      next: (result: VaultSignalRef<any>) => {
        resource.loading.set(result.isLoading());
        resource.value.set(result.value());
        resource.error.set(result.error());
      },
      error: (error) => {
        resource.value.set(null);
        resource.error.set(error.message);
      }
    });

    const data = [
      { id: 3, name: 'Katherine' },
      { id: 4, name: 'Hedy' }
    ];

    // Initially loading = true
    expect(resource.loading()).toBeFalse();
    expect(resource.error()).toBeNull();
    expect(resource.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeTrue();

    // Emit value
    subject.next(data);

    expect(resource.loading()).toBeFalse();
    expect(resource.value()).toEqual(data);
    expect(resource.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should capture error in returned ResourceSignal', () => {
    const resource = {
      loading: signal<boolean>(false),
      value: signal<any | undefined>(undefined),
      error: signal<any | null>(null)
    };

    vault.fromObservable!(subject.asObservable()).subscribe({
      next: (result: VaultSignalRef<any>) => {
        resource.loading.set(result.isLoading());
        resource.value.set(result.value());
        resource.error.set(result.error());
      },
      error: (error) => {
        resource.value.set(null);
        resource.error.set(error);
      }
    });

    subject.error(new Error('Network failure'));

    expect(resource.loading()).toBeFalse();
    expect(resource.value()).toBeNull();
    expect(resource.error()!.message).toContain('Network failure');
  });

  it('should emit events for fromObservable lifecycle', async () => {
    const subject = new Subject<any>();

    let lastRef!: VaultSignalRef<any>;
    vault.fromObservable!(subject.asObservable()).subscribe({
      next: (result) => (lastRef = result)
    });

    subject.next({ id: 1, name: 'Ada' });
    subject.complete();

    expect(lastRef.isLoading()).toBeFalse();
    expect(lastRef.value()).toEqual({ id: 1, name: 'Ada' });
    expect(lastRef.error()).toBeNull();
    await flushMicrotasksZoneless();

    expect(emitted).toEqual([]);
  });
});
