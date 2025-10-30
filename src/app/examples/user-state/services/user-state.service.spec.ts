import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserStateModel } from '../models/user-state.model';
import { UserModel } from '../models/user.model';
import { UserStateService } from './user-state.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockFeatureVault } from '@ngss/state';

describe('Service: User State', () => {
  let service: UserStateService;
  let mockHttpClient: HttpTestingController;
  let mockVault: {
    _set: jasmine.Spy;
    _patch: jasmine.Spy;
    state: ReturnType<typeof signal<UserStateModel>>;
  };

  const initialState: UserStateModel = {
    loading: false,
    entities: {},
    error: null
  };

  beforeEach(() => {
    mockVault = {
      _set: jasmine.createSpy('_set'),
      _patch: jasmine.createSpy('_patch'),
      state: signal<UserStateModel>({ ...initialState })
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideMockFeatureVault('user', mockVault),
        UserStateService
      ]
    });

    service = TestBed.inject(UserStateService);
    mockHttpClient = TestBed.inject(HttpTestingController);
  });

  describe('computed properties', () => {
    it('should reflect users() based on current state', () => {
      const mockUsers: UserModel[] = [
        { id: '1', name: 'Ada' },
        { id: '2', name: 'Grace' }
      ];

      const userList = service.users;

      expect(userList.data()).toEqual([]);
      expect(userList.loading()).toBeTrue();
      expect(userList.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/users');
      expect(result.request.method).toBe('GET');

      result.flush(mockUsers);

      expect(userList.data()).toEqual([
        { id: '1', name: 'Ada' },
        { id: '2', name: 'Grace' }
      ]);

      expect(userList.loading()).toBeFalse();
      expect(userList.error()).toBeNull();
    });

    it('should reflect isLoading() based on current state', () => {
      mockVault.state.set({ ...initialState, loading: true });
      expect(service.isLoading()).toBeTrue();

      mockVault.state.set({ ...initialState, loading: false });
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('loadUsers()', () => {
    it('should set loading to true, then patch users on success', () => {
      const mockUsers: UserModel[] = [
        { id: '1', name: 'Ada' },
        { id: '2', name: 'Grace' }
      ];
      const resourceSignal = service.loadUsers();

      expect(resourceSignal.data()).toBeNull();
      expect(resourceSignal.loading()).toBeTrue();
      expect(resourceSignal.error()).toBeNull();

      const result = mockHttpClient.match('/api/users');
      expect(result[0].request.method).toBe('GET');
      result[0].flush(mockUsers);
      result[1].flush(mockUsers);

      expect(resourceSignal.data()).toEqual(
        Object({ entities: Object({ 1: Object({ id: '1', name: 'Ada' }), 2: Object({ id: '2', name: 'Grace' }) }) })
      );
      expect(resourceSignal.loading()).toBeFalse();
      expect(resourceSignal.error()).toBeNull();
    });

    it('should set error when http fails', () => {
      const resourceSignal = service.loadUsers();

      expect(resourceSignal.data()).toBeNull();
      expect(resourceSignal.loading()).toBeTrue();
      expect(resourceSignal.error()).toBeNull();

      const result = mockHttpClient.match('/api/users');
      expect(result[0].request.method).toBe('GET');

      result[0].flush(
        { message: 'Internal Server Error' }, // response body
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      result[1].flush(
        { message: 'Internal Server Error' }, // response body
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(resourceSignal.data()).toBeNull();
      expect(resourceSignal.loading()).toBeFalse();
      const err = resourceSignal.error();
      expect(err?.status).toBe(500);
      expect(err?.statusText).toBe('Server Error');
      expect(err?.message).toBe('Http failure response for /api/users: 500 Server Error');
      expect(err?.details).toEqual(Object({ message: 'Internal Server Error' }));
    });
  });

  describe('upsert()', () => {
    it('should insert a new user when not existing', () => {
      mockVault.state.set({
        ...initialState,
        entities: { a: { id: 'a', name: 'Alice' } }
      });

      service.upsert({ id: 'b', name: 'Bob' });

      expect(mockVault._patch).toHaveBeenCalledWith({
        entities: {
          a: { id: 'a', name: 'Alice' },
          b: { id: 'b', name: 'Bob' }
        }
      });
    });

    it('should update an existing user when id matches', () => {
      mockVault.state.set({
        ...initialState,
        entities: { a: { id: 'a', name: 'Alice' } }
      });

      service.upsert({ id: 'a', name: 'Alicia' });

      expect(mockVault._patch).toHaveBeenCalledWith({
        entities: { a: { id: 'a', name: 'Alicia' } }
      });
    });
  });

  describe('remove()', () => {
    it('should remove a user by id', () => {
      const state: UserStateModel = {
        loading: false,
        error: null,
        entities: {
          a: { id: 'a', name: 'Alice' },
          b: { id: 'b', name: 'Bob' }
        }
      };
      mockVault.state.set(state);

      service.remove('a');

      expect(mockVault._set).toHaveBeenCalledWith({
        loading: false,
        error: null,
        entities: { b: { id: 'b', name: 'Bob' } }
      });
    });

    it('should handle remove() when id does not exist gracefully', () => {
      const state: UserStateModel = {
        loading: false,
        error: null,
        entities: { b: { id: 'b', name: 'Bob' } }
      };
      mockVault.state.set(state);

      service.remove('x');

      expect(mockVault._set).toHaveBeenCalledWith({
        loading: false,
        error: null,
        entities: { b: { id: 'b', name: 'Bob' } }
      });
    });
  });
});
