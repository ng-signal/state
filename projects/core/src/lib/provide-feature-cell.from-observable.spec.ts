import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ResourceVaultModel, VaultSignalRef } from '@ngvault/shared-models';
import { getTestBehavior, withTestBehavior } from '@ngvault/testing';
import { Subject } from 'rxjs';
import { provideFeatureCell } from './provide-feature-cell';

interface TestModel {
  id: number;
  name: string;
}

describe('ResourceVaultModel (setState, patchState, fromObservable)', () => {
  let vault: ResourceVaultModel<TestModel[] | TestModel>;
  let subject: Subject<TestModel[]>;
  const calls: any = [];

  beforeEach(() => {
    subject = new Subject<TestModel[]>();
    calls.length = 0;

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });

    const injector = TestBed.inject(Injector);
    const providers = provideFeatureCell(class TestService {}, { key: 'http', initial: [] }, [withTestBehavior]);
    const vaultFactory = (providers[0] as any).useFactory;

    runInInjectionContext(injector, () => {
      vault = vaultFactory();
    });
  });

  it('should set state fully with setState()', () => {
    const initial = vault.state.value();
    expect(initial).toEqual([]);

    const newData = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ];
    vault.setState({ loading: true });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    vault.setState({ value: newData, loading: false });
    expect(vault.state.value()).toEqual(newData);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should append arrays when patchState() is called with array data', () => {
    vault.setState({ value: [{ id: 1, name: 'Ada' }] });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: [{ id: 2, name: 'Grace' }] });
    expect(vault.state.value()).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ]);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should shallow merge objects when patchState() is called with object data', () => {
    const providers = provideFeatureCell(class ObjService {}, { key: 'obj', initial: { id: 1, name: 'Ada' } });

    const provider = providers.find((p: any) => typeof p.useFactory === 'function');

    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.patchState({ value: { name: 'Grace' } as any });
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

  it('should emit events for fromObservable lifecycle', () => {
    const subject = new Subject<any>();

    let lastRef!: VaultSignalRef<any>;
    vault.fromObservable!(subject.asObservable()).subscribe({
      next: (result) => (lastRef = result),
      complete: () => {
        expect(lastRef.isLoading()).toBeFalse();
        expect(lastRef.value()).toEqual({ id: 1, name: 'Ada' });
        expect(lastRef.error()).toBeNull();
      }
    });

    expect(getTestBehavior().getEvents()).toEqual(['onInit:http', 'onInit:NgVault::Core::Set', 'onLoad:http']);

    subject.next({ id: 1, name: 'Ada' });
    subject.complete();
  });
});
