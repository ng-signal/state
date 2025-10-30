import { HttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserStateModel } from './models/user-state.model';
import { UserModel } from './models/user.model';
import { UserStateService } from './user-state.service';

import { provideMockFeatureVault } from '@ngss/state';

describe('UserStateService (Jasmine)', () => {
  let service: UserStateService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
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
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    mockVault = {
      _set: jasmine.createSpy('_set'),
      _patch: jasmine.createSpy('_patch'),
      state: signal<UserStateModel>({ ...initialState })
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideMockFeatureVault('user', mockVault),
        { provide: HttpClient, useValue: httpClientSpy },
        UserStateService
      ]
    });

    service = TestBed.inject(UserStateService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('computed properties', () => {
    it('should reflect users() based on current state', () => {
      mockVault.state.set({
        loading: false,
        error: null,
        entities: {
          a: { id: 'a', name: 'Alice' },
          b: { id: 'b', name: 'Bob' }
        }
      });

      const result = service.users();
      expect(result).toEqual([
        { id: 'a', name: 'Alice' },
        { id: 'b', name: 'Bob' }
      ]);
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
      httpClientSpy.get.and.returnValue(of(mockUsers));

      service.loadUsers();

      expect(mockVault._patch).toHaveBeenCalledWith({ loading: true, error: null });

      // simulate async response
      expect(httpClientSpy.get).toHaveBeenCalledWith('/api/users');

      const entities = {
        '1': { id: '1', name: 'Ada' },
        '2': { id: '2', name: 'Grace' }
      };
      expect(mockVault._patch).toHaveBeenCalledWith({ loading: false, entities });
    });

    it('should set error when http fails', () => {
      httpClientSpy.get.and.returnValue(throwError(() => 'NetworkError'));

      service.loadUsers();

      expect(mockVault._patch).toHaveBeenCalledWith({ loading: true, error: null });
      expect(mockVault._patch).toHaveBeenCalledWith({ loading: false, error: 'NetworkError' });
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
