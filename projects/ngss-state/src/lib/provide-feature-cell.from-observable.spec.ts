import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultSignalRef } from '@ngvault/core';
import { Subject } from 'rxjs';
import { ResourceVaultModel } from './models/resource-vault.model';
import { provideFeatureCell } from './provide-feature-cell';

interface TestModel {
  id: number;
  name: string;
}

describe('ResourceVaultModel (setState, patchState, fromObservable)', () => {
  let vault: ResourceVaultModel<TestModel[] | TestModel>;
  let subject: Subject<TestModel[]>;

  beforeEach(() => {
    subject = new Subject<TestModel[]>();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });
    const providers = provideFeatureCell(class TestService {}, { key: 'http', initial: [] });

    const vaultFactory = (providers[0] as any).useFactory;
    runInInjectionContext(TestBed.inject(Injector), () => {
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
      data: signal<any | null>(null),
      error: signal<any | null>(null)
    };

    vault.fromObservable!(subject.asObservable()).subscribe({
      next: (result: VaultSignalRef<any>) => {
        resource.loading.set(result.isLoading());
        resource.data.set(result.value());
        resource.error.set(result.error());
      },
      error: (error) => {
        resource.data.set(null);
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
    expect(resource.data()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    // Emit value
    subject.next(data);

    expect(resource.loading()).toBeFalse();
    expect(resource.data()).toEqual(data);
    expect(resource.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should capture error in returned ResourceSignal', () => {
    const resource = {
      loading: signal<boolean>(false),
      value: signal<any | null>(null),
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

  it('should merge arrays when current and next are both arrays', () => {
    vault.setState({ value: [{ id: 1, name: 'Ada' }] });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: [{ id: 2, name: 'Grace' }] });
    expect(vault.state.value()).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ]);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should merge objects shallowly when both current and next are plain objects', () => {
    // simulate current object state
    vault.setState({ value: { id: 1, name: 'Initial' } as any });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: { name: 'Updated' } as any });
    expect(vault.state.value()).toEqual({ id: 1, name: 'Updated' });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should replace completely when types differ (array → object or null)', () => {
    vault.setState({ value: [{ id: 1, name: 'Ada' }] });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: { id: 99, name: 'Replaced' } as any });
    expect(vault.state.value()).toEqual({ id: 99, name: 'Replaced' });
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState({ value: null });
    expect(vault.state.value()).toBeNull();
    expect(vault.state.hasValue()).toBeFalse();
  });

  it('should update loading when partial.loading is provided', () => {
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ loading: true });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should update error when partial.error is provided', () => {
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();
    const testError = { message: 'Something went wrong' } as any;
    vault.patchState({ error: testError });
    expect(vault.state.error()).toEqual(testError);
    expect(vault.state.hasValue()).toBeTrue();
  });
});
