import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserModel } from '../../../models/user.model';
import { UserStateManualService } from './user-state-manual.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideState } from '@ngss/state';

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
        provideState(UserStateManualService, {
          key: 'userManual',
          initial: null // initial vault state shape
        })
      ]
    });

    service = TestBed.inject(UserStateManualService);
    mockHttpClient = TestBed.inject(HttpTestingController);
  });

  describe('usersWithNames', () => {
    it('should return [] when vault state has no users', () => {
      const result = service.usersWithNames();
      expect(result).toEqual([]);
    });

    it('should compute reversed names when vault state is populated', () => {
      // Arrange: simulate a setState (real method)
      const testUsers: UserModel[] = [
        { id: '1', name: 'Ada Lovelace', firstName: '', lastName: '' },
        { id: '2', name: 'Alan Turing', firstName: '', lastName: '' },
        { id: '3', name: 'Grace Hopper', firstName: '', lastName: '' }
      ];

      // Act: update vault (this is the real reactive store)
      service['vault'].setState({
        loading: false,
        data: testUsers,
        error: null
      });

      // Assert: computed selector should reflect reversed names
      const result = service.usersWithNames();

      expect(result.length).toBe(3);
      expect(result[0]).toEqual(
        jasmine.objectContaining({
          id: '1',
          name: 'Ada Lovelace',
          firstName: 'Lovelace',
          lastName: 'Ada'
        })
      );
      expect(result[1]).toEqual(
        jasmine.objectContaining({
          id: '2',
          name: 'Alan Turing',
          firstName: 'Turing',
          lastName: 'Alan'
        })
      );
      expect(result[2]).toEqual(
        jasmine.objectContaining({
          id: '3',
          name: 'Grace Hopper',
          firstName: 'Hopper',
          lastName: 'Grace'
        })
      );
    });

    it('should handle single-word names gracefully', () => {
      service['vault'].setState({
        loading: false,
        data: [{ id: '4', name: 'Cher', firstName: '', lastName: '' }],
        error: null
      });

      const result = service.usersWithNames();

      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe('');
      expect(result[0].lastName).toBe('Cher');
    });

    it('should recompute reactively when vault data changes', () => {
      service['vault'].setState({
        loading: false,
        data: [{ id: '1', name: 'Ada Lovelace', firstName: '', lastName: '' }],
        error: null
      });

      const first = service.usersWithNames();
      expect(first[0].name).toBe('Ada Lovelace');

      // Update real vault again — signal change should propagate
      service['vault'].setState({
        loading: false,
        data: [{ id: '2', name: 'Alan Turing', firstName: '', lastName: '' }],
        error: null
      });

      const second = service.usersWithNames();
      expect(second[0].name).toBe('Alan Turing');
    });

    it('should handle no name', () => {
      service['vault'].setState({
        loading: false,
        data: [{ id: '1', name: '', firstName: '', lastName: '' }],
        error: null
      });

      const first = service.usersWithNames();
      expect(first[0].name).toBe('');

      // Update real vault again — signal change should propagate
      service['vault'].setState({
        loading: false,
        data: [{ id: '2', name: '', firstName: '', lastName: '' }],
        error: null
      });

      const second = service.usersWithNames();
      expect(second[0].name).toBe('');
    });
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
