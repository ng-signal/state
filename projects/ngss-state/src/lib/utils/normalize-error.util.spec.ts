import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { normalizeError } from './normalize-error.util';
import { createResourceSignal } from './resource-signal.util';

describe('Util: normalizeError', () => {
  it('should normalize HttpErrorResponse correctly', () => {
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
      error: 'Internal Failure'
    });

    const result = normalizeError(httpError);
    expect(result).toEqual(
      jasmine.objectContaining({
        message: 'Http failure response for (unknown url): 500 Server Error',
        status: 500,
        statusText: 'Server Error',
        details: 'Internal Failure'
      })
    );
  });

  it('should normalize generic Error objects', () => {
    const error = new Error('Boom!');
    const result = normalizeError(error);

    expect(result.message).toBe('Boom!');
    expect(result.details).toContain('Error: Boom');
  });

  it('should normalize string errors', () => {
    const result = normalizeError('Something bad');
    expect(result).toEqual({
      message: 'Something bad',
      details: 'Something bad'
    });
  });

  it('should normalize unknown object types', () => {
    const weird = { foo: 'bar' };
    const result = normalizeError(weird);

    expect(result).toEqual({
      message: 'Unexpected error',
      details: weird
    });
  });

  it('should default to Unexpected error for null or undefined', () => {
    expect(normalizeError(null)).toEqual({
      message: 'Unexpected error',
      details: null
    });

    expect(normalizeError(undefined)).toEqual({
      message: 'Unexpected error',
      details: undefined
    });
  });

  it('should handle unknown error type (non-Error)', () => {
    const weirdError = { info: 'strange error' };
    const resource = createResourceSignal(throwError(() => weirdError));

    const err = resource.error()!;
    expect(err.message).toContain('Unexpected error');
    expect(err.details).toEqual(weirdError);
    expect(resource.data()).toBeNull();
    expect(resource.loading()).toBeFalse();
  });

  it('should use statusText when HttpErrorResponse.message is empty', () => {
    const httpError = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      error: 'Missing resource'
    });
    // Manually blank out the message to hit fallback branch
    Object.defineProperty(httpError, 'message', { value: '', writable: false });

    const result = normalizeError(httpError);
    expect(result.message).toBe('Not Found');
    expect(result.status).toBe(404);
    expect(result.statusText).toBe('Not Found');
    expect(result.details).toBe('Missing resource');
  });

  it('should fall back to "HTTP error" when both message and statusText are empty', () => {
    const httpError = new HttpErrorResponse({ status: 500, error: 'Oops!' });
    Object.defineProperty(httpError, 'message', { value: '', writable: false });
    Object.defineProperty(httpError, 'statusText', { value: '', writable: false });

    const result = normalizeError(httpError);
    expect(result.message).toBe('HTTP error');
    expect(result.details).toBe('Oops!');
  });

  it('should use "Unexpected error" when Error.message is empty', () => {
    const err = new Error('');
    const result = normalizeError(err);
    expect(result.message).toBe('Unexpected error');
    expect(result.details).toContain('Error');
  });

  it('should handle numeric error values correctly', () => {
    const result = normalizeError(404);
    expect(result).toEqual({
      message: 'Unexpected error',
      details: 404
    });
  });

  it('should handle boolean error values correctly', () => {
    const result = normalizeError(false);
    expect(result).toEqual({
      message: 'Unexpected error',
      details: false
    });
  });
});
