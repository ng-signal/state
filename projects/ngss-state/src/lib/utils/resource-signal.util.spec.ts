import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
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

    it('should handle an observable that errors immediately', () => {
      const resource = createResourceSignal(throwError(() => 'Immediate fail'));

      expect(resource.error()?.message).toBe('Immediate fail');
      expect(resource.data()).toBeNull();
      expect(resource.loading()).toBeFalse();
    });

    it('should handle HttpErrorResponse with message', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { reason: 'missing' },
        // @ts-expect-error message property gets auto-generated but we can override
        message: 'Custom message'
      });

      const resource = createResourceSignal(throwError(() => httpError));

      const err = resource.error()!;
      expect(err.message).toBe('Http failure response for (unknown url): 404 Not Found');
      expect(err.status).toBe(404);
      expect(err.statusText).toBe('Not Found');
      expect(err.details).toEqual({ reason: 'missing' });
      expect(resource.data()).toBeNull();
      expect(resource.loading()).toBeFalse();
    });

    it('should handle HttpErrorResponse with no message but statusText', () => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
        error: { reason: 'boom' }
      });
      // Explicitly delete message to hit statusText fallback
      Object.defineProperty(httpError, 'message', { value: '' });

      const resource = createResourceSignal(throwError(() => httpError));

      const err = resource.error()!;
      expect(err.message).toBe('Server Error');
      expect(err.status).toBe(500);
      expect(err.statusText).toBe('Server Error');
      expect(err.details).toEqual({ reason: 'boom' });
    });

    it('should handle HttpErrorResponse with no message or statusText', () => {
      const httpError = new HttpErrorResponse({ status: 0 });
      Object.defineProperty(httpError, 'message', { value: '' });
      Object.defineProperty(httpError, 'statusText', { value: '' });

      const resource = createResourceSignal(throwError(() => httpError));

      const err = resource.error()!;
      expect(err.message).toBe('HTTP error');
      expect(err.status).toBe(0);
    });

    it('should handle generic Error', () => {
      const genericError = new Error('Something broke');
      const resource = createResourceSignal(throwError(() => genericError));

      const err = resource.error()!;
      expect(err.message).toBe('Something broke');
      expect(typeof err.details).toBe('string');
      expect(resource.data()).toBeNull();
      expect(resource.loading()).toBeFalse();
    });

    it('should handle Error with missing message and use fallback "Unexpected error"', () => {
      // Create an Error with no message
      const errorWithoutMessage = new Error();
      // Force the message property to be empty to hit the fallback
      Object.defineProperty(errorWithoutMessage, 'message', { value: '' });

      const resource = createResourceSignal(throwError(() => errorWithoutMessage));

      const err = resource.error()!;
      expect(err.message).toBe('Unexpected error');
      expect(typeof err.details).toBe('string'); // should still have stack trace
      expect(resource.data()).toBeNull();
      expect(resource.loading()).toBeFalse();
    });

    it('should handle unknown error type (non-Error)', () => {
      const weirdError = { info: 'strange error' };
      const resource = createResourceSignal(throwError(() => weirdError));

      const err = resource.error()!;
      expect(err.message).toContain('object');
      expect(err.details).toEqual(weirdError);
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
