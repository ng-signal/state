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
      vault.initialize();
    });
    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
  });

  it('should return independent ResourceSignal when fromObservable() succeeds', () => {
    expect(vault.state.hasValue()).toBeTrue();
    expect(vault.state.value()).toEqual([]);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();

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

    expect(vault.state.value()).toEqual([]);
    expect(vault.state.hasValue()).toBeTrue();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();

    // Emit value
    subject.next(data);

    expect(resource.loading()).toBeFalse();
    expect(resource.value()).toEqual(data);
    expect(resource.error()).toBeNull();

    expect(vault.state.value()).toEqual([]);
    expect(vault.state.hasValue()).toBeTrue();

    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
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
    await flushMicrotasksZoneless();

    subject.next({ id: 1, name: 'Ada' });
    subject.complete();

    expect(lastRef.isLoading()).toBeFalse();
    expect(lastRef.value()).toEqual({ id: 1, name: 'Ada' });
    expect(lastRef.error()).toBeNull();
    await flushMicrotasksZoneless();

    expect(emitted).toEqual([]);
  });
});
