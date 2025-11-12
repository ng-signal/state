import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserModel } from '../../../models/user.model';
import { UserCellManualService } from './user-cell-manual.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideFeatureCell } from '@ngvault/core';
import { flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { getUserData } from 'src/testing/data/user.data';

describe('Service: User Cell Manual', () => {
  let service: UserCellManualService;
  let mockHttpClient: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideFeatureCell(UserCellManualService, {
          key: 'userManual',
          initial: null // initial vault state shape
        })
      ]
    });

    service = TestBed.inject(UserCellManualService);
    mockHttpClient = TestBed.inject(HttpTestingController);
  });

  describe('loadUsers()', () => {
    it('should set loading to true, then set users on success', async () => {
      const mockUsers: UserModel[] = [
        { id: '1', name: 'Ada' },
        { id: '2', name: 'Grace' }
      ];

      service.loadUsers();

      const state = service.users();

      expect(state.value()).toBeUndefined();
      expect(state.isLoading()).toBeTrue();
      expect(state.error()).toBeNull();

      mockHttpClient.expectOne('/api/users').flush(mockUsers);
      await flushMicrotasksZoneless();

      expect(state.value()).toEqual([Object({ id: '1', name: 'Ada' }), Object({ id: '2', name: 'Grace' })]);
      expect(state.hasValue()).toBeTrue();

      expect(state.isLoading()).toBeFalse();
      expect(state.error()).toBeNull();
    });

    it('should set error when http fails', async () => {
      service.loadUsers();

      const state = service.users();
      TestBed.tick();

      expect(state.value()).toBeUndefined();
      expect(state.isLoading()).toBeTrue();
      expect(state.error()).toBeNull();
      expect(state.hasValue()).toBeFalse();

      mockHttpClient.expectOne('/api/users').flush(
        { message: 'Internal Server Error' }, // response body
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      await flushMicrotasksZoneless();

      expect(state.value()).toBeUndefined();
      expect(state.isLoading()).toBeFalse();
      expect(state.hasValue()).toBeFalse();
      const err = state.error();
      expect(err?.status).toBe(500);
      expect(err?.statusText).toBe('Server Error');
      expect(err?.message).toBe('Http failure response for /api/users: 500 Server Error');
      expect(err?.details).toEqual(Object({ message: 'Internal Server Error' }));
    });
  });

  describe('loadUser()', () => {
    it('should set loading to true, then set user on success', async () => {
      service.loadUser('1');

      const state = service.users();

      expect(state.value()).toBeUndefined();
      expect(state.isLoading()).toBeTrue();
      expect(state.error()).toBeNull();

      mockHttpClient.expectOne('/api/users/1').flush(getUserData(0, false));
      await flushMicrotasksZoneless();

      expect(state.value()).toEqual([Object({ id: '1', name: 'Ada Lovelace', carId: 2 })]);
      expect(state.hasValue()).toBeTrue();

      expect(state.isLoading()).toBeFalse();
      expect(state.error()).toBeNull();
    });

    it('should set error when http fails', async () => {
      service.loadUser('1');

      const state = service.users();
      TestBed.tick();

      expect(state.value()).toBeUndefined();
      expect(state.isLoading()).toBeTrue();
      expect(state.error()).toBeNull();
      expect(state.hasValue()).toBeFalse();

      const result = mockHttpClient.expectOne('/api/users/1');
      expect(result.request.method).toBe('GET');

      result.flush(
        { message: 'Internal Server Error' }, // response body
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(state.value()).toBeUndefined();
      expect(state.isLoading()).toBeFalse();
      expect(state.hasValue()).toBeFalse();
      const err = state.error();
      expect(err?.status).toBe(500);
      expect(err?.statusText).toBe('Server Error');
      expect(err?.message).toBe('Http failure response for /api/users/1: 500 Server Error');
      expect(err?.details).toEqual(Object({ message: 'Internal Server Error' }));
    });
  });
});
