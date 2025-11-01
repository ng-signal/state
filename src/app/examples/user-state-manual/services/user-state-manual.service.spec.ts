import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserModel } from '../../models/user.model';
import { UserStateManualService } from './user-state-manual.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideState, provideStore } from '@ngss/state';

describe('Service: User State Manual', () => {
  let service: UserStateManualService;
  let mockHttpClient: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideStore(),
        provideState(UserStateManualService, {
          key: 'userManual',
          initial: null // initial vault state shape
        })
      ]
    });

    service = TestBed.inject(UserStateManualService);
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
    it('should set loading to true, then set users on success', () => {
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
});
