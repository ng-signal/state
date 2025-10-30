import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FeatureDescriptorModel } from '@ngss/state';
import { FEATURE_REGISTRY } from './constants/feature-registry.constant';
import { FeatureVaultModel } from './models/feature-vault.model';
import { provideState } from './provide-state';

// Dummy service + state for testing
class TestFeatureService {}
interface TestState {
  count: number;
  name: string;
}

describe('provideState', () => {
  let providers: any[];
  let desc: FeatureDescriptorModel<TestState>;

  beforeEach(() => {
    desc = { key: 'testFeature', initial: { count: 1, name: 'init' } };
    providers = provideState(TestFeatureService, desc);
  });

  it('should create a vault with state, _set, and _patch methods', () => {
    const vaultProvider = providers[0] as any;
    const factory = vaultProvider.useFactory as () => FeatureVaultModel<TestState>;
    const vault = factory();

    // Validate vault structure
    expect(vault).toBeTruthy();
    expect(typeof vault._set).toBe('function');
    expect(typeof vault._patch).toBe('function');
    expect(vault.state).toBeTruthy();

    // Verify initial state
    expect(vault.state().count).toBe(1);
    expect(vault.state().name).toBe('init');

    // Verify _set updates full state
    vault._set({ count: 5, name: 'updated' });
    expect(vault.state().count).toBe(5);
    expect(vault.state().name).toBe('updated');

    // Verify _patch merges partial state
    vault._patch({ name: 'patched' });
    expect(vault.state().count).toBe(5);
    expect(vault.state().name).toBe('patched');
  });

  it('should register feature with correct key and token', () => {
    const registryProvider = providers[2] as any;
    expect(registryProvider.provide).toBe(FEATURE_REGISTRY);
    expect(registryProvider.multi).toBeTrue();
    expect(registryProvider.useValue).toEqual({
      key: 'testFeature',
      token: TestFeatureService
    });
  });

  it('should be usable inside TestBed to resolve vault instance', () => {
    const vaultToken = (providers[0] as any).provide;

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...providers]
    });

    const vault = TestBed.inject(vaultToken) as FeatureVaultModel<TestState>;
    expect(vault.state().count).toBe(1);

    vault._patch({ count: 10 });
    expect(vault.state().count).toBe(10);
  });
});
