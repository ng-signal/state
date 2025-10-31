import { HttpErrorResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FeatureDescriptorModel } from '@ngss/state';
import { of, Subject, throwError } from 'rxjs';
import { FEATURE_REGISTRY } from './constants/feature-registry.constant';
import { ResourceVaultModel } from './models/resource-vault.model';
import { provideState } from './provide-state';

/** Dummy feature service and model for testing */
class TestFeatureService {}
interface TestModel {
  id: number;
  name: string;
}

describe('provideState (vault lifecycle)', () => {
  let providers: any[];
  let desc: FeatureDescriptorModel<TestModel[]>;

  beforeEach(() => {
    desc = {
      key: 'testFeature',
      initial: [{ id: 1, name: 'Initial' }]
    };
    providers = provideState(TestFeatureService, desc);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...providers]
    });
  });

  it('should initialize vault with proper signals and defaults', () => {
    const vaultToken = (providers[0] as any).provide;
    const vault = TestBed.inject(vaultToken) as ResourceVaultModel<TestModel[]>;

    expect(vault).toBeTruthy();
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.data()).toEqual([{ id: 1, name: 'Initial' }]);
  });

  it('should update loading and data when observable emits successfully', (done) => {
    const vaultToken = (providers[0] as any).provide;
    const vault = TestBed.inject(vaultToken) as ResourceVaultModel<TestModel[]>;

    const subject = new Subject<TestModel[]>();
    vault.fromResource!(subject.asObservable());

    // Initially, loading should be true
    expect(vault.state.loading()).toBeTrue();
    expect(vault.state.error()).toBeNull();

    // Emit next value
    const newValue = [
      { id: 2, name: 'Ada' },
      { id: 3, name: 'Grace' }
    ];
    subject.next(newValue);

    // Verify update
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.data()).toEqual(newValue);
    expect(vault.state.error()).toBeNull();

    // Complete the observable
    subject.complete();
    expect(vault.state.loading()).toBeFalse();
    done();
  });

  it('should throw an error if initial includes resource-like fields', () => {
    const badDescriptor = {
      key: 'user',
      initial: { loading: false, data: [], error: null } as any
    };

    const providers = provideState(class TestSvc {}, badDescriptor);
    const vaultProvider = providers[0] as any;

    expect(() => vaultProvider.useFactory()).toThrowError(
      `[NGSS] Invalid FeatureDescriptorModel.initial for feature "user". Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. Pass plain data to avoid double-wrapping.`
    );
  });

  it('should handle generic Error correctly', () => {
    const vaultToken = (providers[0] as any).provide;
    const vault = TestBed.inject(vaultToken) as ResourceVaultModel<TestModel[]>;

    const err = new Error('Boom!');
    vault.fromResource!(throwError(() => err));

    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.data()).toBeNull();
    const error = vault.state.error();
    expect(error).toBeTruthy();
    expect(error?.message).toBe('Boom!');
  });

  it('should update state correctly on immediate observable', () => {
    const vaultToken = (providers[0] as any).provide;
    const vault = TestBed.inject(vaultToken) as ResourceVaultModel<TestModel[]>;

    const newData = [{ id: 10, name: 'Instant' }];
    vault.fromResource!(of(newData));

    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.data()).toEqual(newData);
    expect(vault.state.error()).toBeNull();
  });

  it('should keep loading false after observable completes', (done) => {
    const vaultToken = (providers[0] as any).provide;
    const vault = TestBed.inject(vaultToken) as ResourceVaultModel<TestModel[]>;

    const subject = new Subject<TestModel[]>();
    vault.fromResource!(subject.asObservable());

    expect(vault.state.loading()).toBeTrue();

    subject.complete();
    expect(vault.state.loading()).toBeFalse();
    done();
  });

  it('should register correct FEATURE_REGISTRY entry', () => {
    const registry = TestBed.inject(FEATURE_REGISTRY);
    const entry = registry.find((r: any) => r.key === 'testFeature');
    expect(entry).toEqual({
      key: 'testFeature',
      token: TestFeatureService
    });
  });

  it('should initialize data to null when no initial state is provided', () => {
    const providers = provideState<TestFeatureService, TestModel>(TestFeatureService, {
      key: 'dummy',
      initial: undefined as any
    });

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...providers]
    });

    const vault = TestBed.inject((providers[0] as any).provide) as ResourceVaultModel<TestModel>;

    expect(vault.state.data()).toBeNull();
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
  });

  it('should handle errors emitted by fromResource and normalize them', () => {
    const providers = provideState<TestFeatureService, TestModel>(TestFeatureService, {
      key: 'error-case',
      initial: { id: 1, name: 'Initial' }
    });

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...providers]
    });

    const vault = TestBed.inject((providers[0] as any).provide) as ResourceVaultModel<TestModel>;

    // Simulate an HttpErrorResponse being emitted
    const errorResponse = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
      error: 'Internal failure'
    });

    const source$ = throwError(() => errorResponse);
    vault.fromResource!(source$);

    const err = vault.state.error();
    expect(err?.message).toContain('Server Error');
    expect(err?.status).toBe(500);
    expect(err?.statusText).toBe('Server Error');
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.data()).toBeNull();
  });
});
