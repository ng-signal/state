import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserModel } from '../models/user.model';
import { UserStateService } from './user-state.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideState, provideStore } from '@ngss/state';

describe('Service: User State', () => {
  let service: UserStateService;
  let mockHttpClient: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideStore(),
        provideState(UserStateService, {
          key: 'user',
          initial: null // initial vault state shape
        })
      ]
    });

    service = TestBed.inject(UserStateService);
    mockHttpClient = TestBed.inject(HttpTestingController);
  });

  describe('users', () => {
    it('should reflect users() based on current state', () => {
      const mockUsers: UserModel[] = [
        { id: '1', name: 'Ada' },
        { id: '2', name: 'Grace' }
      ];

      const userList = service.users();

      expect(userList.data()).toBeNull();
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
  });

  describe('loadUsers()', () => {
    it('should set loading to true, then patch users on success', () => {
      const mockUsers: UserModel[] = [
        { id: '1', name: 'Ada' },
        { id: '2', name: 'Grace' }
      ];
      service.loadUsers();

      const state = service.users();

      expect(state.data()).toBeNull();
      expect(state.loading()).toBeTrue();
      expect(state.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/users');
      expect(result.request.method).toBe('GET');
      result.flush(mockUsers);

      expect(state.data()).toEqual([Object({ id: '1', name: 'Ada' }), Object({ id: '2', name: 'Grace' })]);

      expect(state.loading()).toBeFalse();
      expect(state.error()).toBeNull();
    });

    it('should set error when http fails', () => {
      service.loadUsers();

      const state = service.users();

      expect(state.data()).toBeNull();
      expect(state.loading()).toBeTrue();
      expect(state.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/users');
      expect(result.request.method).toBe('GET');

      result.flush(
        { message: 'Internal Server Error' }, // response body
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(state.data()).toBeNull();
      expect(state.loading()).toBeFalse();
      const err = state.error();
      expect(err?.status).toBe(500);
      expect(err?.statusText).toBe('Server Error');
      expect(err?.message).toBe('Http failure response for /api/users: 500 Server Error');
      expect(err?.details).toEqual(Object({ message: 'Internal Server Error' }));
    });
  });

  /*
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
  */
});
