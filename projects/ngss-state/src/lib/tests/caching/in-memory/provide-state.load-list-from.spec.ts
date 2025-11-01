import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FeatureDescriptorModel } from '@ngss/state';
import { Observable, Subject } from 'rxjs';
import { ResourceVaultModel } from '../../../models/resource-vault.model';
import { provideState } from '../../../provide-state';

interface TestModel {
  id: number;
  name: string;
}

describe('Vault loadListFrom() Caching Behavior', () => {
  let providers: any[];
  let vault: ResourceVaultModel<TestModel[]>;

  beforeEach(() => {
    const desc: FeatureDescriptorModel<TestModel[]> = {
      key: 'cache-test',
      initial: null as any
    };

    providers = provideState(class CacheTestService {}, desc, { strategy: 'memory' });

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection(), ...providers]
    }).compileComponents();

    const vaultToken = (providers[0] as any).provide;
    vault = TestBed.inject(vaultToken) as ResourceVaultModel<TestModel[]>;
  });

  it('should populate cache after successful HTTP fetch', () => {
    const subject = new Subject<TestModel[]>();
    vault.loadListFrom!(subject.asObservable());

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
  });

  it('should return early if cache already has data', () => {
    const subject = new Subject<TestModel[]>();
    vault.loadListFrom!(subject.asObservable());

    // Initially, loading should be true
    expect(vault.state.loading()).toBeTrue();
    expect(vault.state.error()).toBeNull();

    // Emit next value
    subject.next([]);

    // Verify update
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.data()).toEqual([]);
    expect(vault.state.error()).toBeNull();

    // Emit next value
    const newValue = [
      { id: 2, name: 'Ada' },
      { id: 3, name: 'Grace' }
    ];
    vault.loadListFrom!(subject.asObservable());
    subject.next(newValue);

    // Verify update
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.data()).toEqual(newValue);
    expect(vault.state.error()).toBeNull();

    const notUpdatedValues = [
      { id: 4, name: 'Bruce' },
      { id: 5, name: 'Wayne' }
    ];
    vault.loadListFrom!(subject.asObservable());
    subject.next(notUpdatedValues);

    // Verify update
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.data()).toEqual(newValue);
    expect(vault.state.error()).toBeNull();

    // Complete the observable
    subject.complete();
    expect(vault.state.loading()).toBeFalse();
  });

  it('should return early and preserve data when cache already has data', () => {
    const subject = new Subject<TestModel[]>();

    vault.loadListFrom!(subject.asObservable());

    // Initial state
    expect(vault.state.loading()).toBeTrue();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.data()).toBeNull();

    // Simulate first successful load
    const initialData = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ];
    subject.next(initialData);
    subject.complete();

    // Verify cache + signals populated
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.data()).toEqual(initialData);

    const newSubject = new Observable<TestModel[]>((observer) => {
      fail('loadListFrom should not re-subscribe when cache already exists');
      observer.next([
        { id: 3, name: 'Bruce' },
        { id: 4, name: 'Wayne' }
      ]);
      observer.complete();
    });

    vault.loadListFrom!(newSubject);

    // Verify state unchanged (from cache)
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.data()).toEqual(initialData);
  });
});
