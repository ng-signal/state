import { signal } from '@angular/core';
import { ResourceSignal } from '@ngvault/core';
import { Subject } from 'rxjs';
import { ResourceVaultModel } from '../../models/resource-vault.model';
import { provideFeatureCell } from '../../provide-feature-cell';

interface TestModel {
  id: number;
  name: string;
}

describe('ResourceVaultModel (setState, patchState, fromObservable)', () => {
  let vault: ResourceVaultModel<TestModel[] | TestModel>;
  let subject: Subject<TestModel[]>;

  beforeEach(() => {
    const providers = provideFeatureCell(class TestService {}, { key: 'test', initial: [] });
    const vaultFactory = (providers[0] as any).useFactory;
    vault = vaultFactory();
    subject = new Subject<TestModel[]>();
  });

  it('should set state fully with setState()', () => {
    const initial = vault.state.data();
    expect(initial).toEqual([]);

    const newData = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ];
    vault.setState({ loading: true });
    expect(vault.state.loading()).toBeTrue();

    vault.setState({ data: newData, loading: false });
    expect(vault.state.data()).toEqual(newData);
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
  });

  it('should append arrays when patchState() is called with array data', () => {
    vault.setState({ data: [{ id: 1, name: 'Ada' }] });
    vault.patchState({ data: [{ id: 2, name: 'Grace' }] });
    expect(vault.state.data()).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ]);
  });

  it('should shallow merge objects when patchState() is called with object data', () => {
    const providers = provideFeatureCell(class ObjService {}, { key: 'obj', initial: { id: 1, name: 'Ada' } });
    const vaultFactory = (providers[0] as any).useFactory;
    const objVault = vaultFactory();

    objVault.patchState({ data: { name: 'Grace' } as any });
    expect(objVault.state.data()).toEqual({ id: 1, name: 'Grace' });
  });

  it('should return independent ResourceSignal when fromObservable() succeeds', () => {
    const resource = {
      loading: signal<boolean>(false),
      data: signal<any | null>(null),
      error: signal<any | null>(null)
    };

    vault.fromObservable!(subject.asObservable()).subscribe({
      next: (result: ResourceSignal<any>) => {
        resource.loading.set(result.loading());
        resource.data.set(result.data());
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

    // Emit value
    subject.next(data);

    expect(resource.loading()).toBeFalse();
    expect(resource.data()).toEqual(data);
    expect(resource.error()).toBeNull();
  });

  it('should capture error in returned ResourceSignal', () => {
    const resource = {
      loading: signal<boolean>(false),
      data: signal<any | null>(null),
      error: signal<any | null>(null)
    };

    vault.fromObservable!(subject.asObservable()).subscribe({
      next: (result: ResourceSignal<any>) => {
        resource.loading.set(result.loading());
        resource.data.set(result.data());
        resource.error.set(result.error());
      },
      error: (error) => {
        resource.data.set(null);
        resource.error.set(error);
      }
    });

    subject.error(new Error('Network failure'));

    expect(resource.loading()).toBeFalse();
    expect(resource.data()).toBeNull();
    expect(resource.error()!.message).toContain('Network failure');
  });

  it('should merge arrays when current and next are both arrays', () => {
    vault.setState({ data: [{ id: 1, name: 'Ada' }] });
    vault.patchState({ data: [{ id: 2, name: 'Grace' }] });
    expect(vault.state.data()).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ]);
  });

  it('should merge objects shallowly when both current and next are plain objects', () => {
    // simulate current object state
    vault.setState({ data: { id: 1, name: 'Initial' } as any });
    vault.patchState({ data: { name: 'Updated' } as any });
    expect(vault.state.data()).toEqual({ id: 1, name: 'Updated' });
  });

  it('should replace completely when types differ (array → object or null)', () => {
    vault.setState({ data: [{ id: 1, name: 'Ada' }] });
    vault.patchState({ data: { id: 99, name: 'Replaced' } as any });
    expect(vault.state.data()).toEqual({ id: 99, name: 'Replaced' });

    vault.patchState({ data: null });
    expect(vault.state.data()).toBeNull();
  });

  it('should update loading when partial.loading is provided', () => {
    expect(vault.state.loading()).toBeFalse();
    vault.patchState({ loading: true });
    expect(vault.state.loading()).toBeTrue();
  });

  it('should update error when partial.error is provided', () => {
    expect(vault.state.error()).toBeNull();
    const testError = { message: 'Something went wrong' } as any;
    vault.patchState({ error: testError });
    expect(vault.state.error()).toEqual(testError);
  });
});
