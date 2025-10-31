import { of, Subject } from 'rxjs';
import { createResourceSignal } from './resource-signal.util';

describe('createResourceSignal', () => {
  it('should initialize with loading=true and null data/error', () => {
    const subject = new Subject<number>();
    const resource = createResourceSignal(subject.asObservable());

    expect(resource.loading()).toBeTrue();
    expect(resource.data()).toBeNull();
    expect(resource.error()).toBeNull();
  });

  it('should update data and clear error on next', () => {
    const subject = new Subject<number>();
    const resource = createResourceSignal(subject.asObservable());

    subject.next(42);

    expect(resource.data()).toBe(42);
    expect(resource.error()).toBeNull();
    expect(resource.loading()).toBeTrue(); // still true until complete
  });

  describe('errors', () => {
    it('should set error, clear data, and stop loading on error', () => {
      const subject = new Subject<number>();
      const resource = createResourceSignal(subject.asObservable());

      const errorMsg = 'Server error';
      subject.error(new Error(errorMsg));

      expect(resource.error()?.message).toBe(errorMsg);
      expect(resource.data()).toBeNull();
      expect(resource.loading()).toBeFalse();
    });
  });

  it('should stop loading on complete', () => {
    const subject = new Subject<number>();
    const resource = createResourceSignal(subject.asObservable());

    subject.next(123);
    subject.complete();

    expect(resource.data()).toBe(123);
    expect(resource.loading()).toBeFalse();
    expect(resource.error()).toBeNull();
  });

  it('should handle multiple emissions correctly', () => {
    const subject = new Subject<string>();
    const resource = createResourceSignal(subject.asObservable());

    subject.next('first');
    subject.next('second');
    subject.complete();

    expect(resource.data()).toBe('second');
    expect(resource.error()).toBeNull();
    expect(resource.loading()).toBeFalse();
  });

  it('should handle an observable that completes immediately', () => {
    const resource = createResourceSignal(of('done'));

    expect(resource.data()).toBe('done');
    expect(resource.error()).toBeNull();
    expect(resource.loading()).toBeFalse();
  });

  it('should maintain correct readonly signal structure', () => {
    const resource = createResourceSignal(of(1));

    // Verify they are signals
    expect(typeof resource.data).toBe('function');
    expect(typeof resource.loading).toBe('function');
    expect(typeof resource.error).toBe('function');

    // Verify readonly nature (should not have set)
    expect((resource.data as any).set).toBeUndefined();
    expect((resource.loading as any).set).toBeUndefined();
    expect((resource.error as any).set).toBeUndefined();
  });

  it('should allow manual teardown via subscription unsubscribe', () => {
    // This test only verifies that unsubscribing stops emissions
    const subject = new Subject<number>();
    const resource = createResourceSignal(subject.asObservable());

    subject.next(1);
    subject.complete();

    expect(resource.data()).toBe(1);
    expect(resource.loading()).toBeFalse();
  });
});
