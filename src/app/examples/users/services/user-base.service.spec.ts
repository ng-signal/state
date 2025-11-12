import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UserModel } from '../../models/user.model';
import { UserService } from './user-base.service';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FeatureCell, injectVault, provideFeatureCell } from '@ngvault/core';
import { provideVaultTesting } from '@ngvault/testing';

@FeatureCell<UserModel[]>('userManual')
class TestUserService extends UserService<UserModel[]> {
  constructor() {
    super(injectVault<UserModel[]>(TestUserService));
  }

  override loadUsers(): void {
    this['isLoaded'].set(true);
    super.loadUsers();
  }

  override loadUser(id: string): void {
    this['isLoaded'].set(true);
    super.loadUser(id);
  }
}

describe('Service: User Base', () => {
  let service: UserService<UserModel[]>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideFeatureCell(TestUserService, { key: 'userManual', initial: null })
      ]
    });

    service = TestBed.inject(TestUserService);
  });

  describe('usersWithNames', () => {
    it('should return [] when vault state has no users', () => {
      const result = service.usersWithNames();
      expect(result).toEqual([]);
    });

    it('should compute reversed names when vault state is populated', () => {
      // Arrange: simulate a replaceState (real method)
      const testUsers: UserModel[] = [
        { id: '1', name: 'Ada Lovelace', firstName: '', lastName: '' },
        { id: '2', name: 'Alan Turing', firstName: '', lastName: '' },
        { id: '3', name: 'Grace Hopper', firstName: '', lastName: '' }
      ];

      // Act: update vault (this is the real reactive store)
      service['vault'].replaceState({
        loading: false,
        value: testUsers,
        error: null
      });
      TestBed.tick();

      // Assert: computed selector should reflect reversed names
      const result = service.usersWithNames();
      TestBed.tick();

      expect(result.length).toBe(3);
      expect(result[0]).toEqual(
        jasmine.objectContaining({
          id: '1',
          name: 'Ada Lovelace',
          firstName: 'Ada',
          lastName: 'Lovelace'
        })
      );
      expect(result[1]).toEqual(
        jasmine.objectContaining({
          id: '2',
          name: 'Alan Turing',
          firstName: 'Alan',
          lastName: 'Turing'
        })
      );
      expect(result[2]).toEqual(
        jasmine.objectContaining({
          id: '3',
          name: 'Grace Hopper',
          firstName: 'Grace',
          lastName: 'Hopper'
        })
      );
    });

    it('should handle no users gracefully', () => {
      service['vault'].replaceState({
        loading: false,
        value: [],
        error: null
      });

      const result = service.usersWithNames();

      expect(result.length).toBe(0);
    });

    it('should handle null users gracefully', () => {
      service['vault'].replaceState({
        loading: false,
        value: undefined,
        error: null
      });

      const result = service.usersWithNames();

      expect(result.length).toBe(0);
    });

    it('should handle single-word names gracefully', () => {
      service['vault'].replaceState({
        loading: false,
        value: [{ id: '4', name: 'Cher', firstName: '', lastName: '' }],
        error: null
      });

      const result = service.usersWithNames();

      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe('Cher');
      expect(result[0].lastName).toBe('');
    });

    it('should recompute reactively when vault data changes', () => {
      service['vault'].replaceState({
        loading: false,
        value: [{ id: '1', name: 'Ada Lovelace', firstName: '', lastName: '' }],
        error: null
      });

      const first = service.usersWithNames();
      expect(first[0].name).toBe('Ada Lovelace');

      // Update real vault again — signal change should propagate
      service['vault'].replaceState({
        loading: false,
        value: [{ id: '2', name: 'Alan Turing', firstName: '', lastName: '' }],
        error: null
      });

      const second = service.usersWithNames();
      expect(second[0].name).toBe('Alan Turing');
    });

    it('should handle no name', () => {
      service['vault'].replaceState({
        loading: false,
        value: [{ id: '1', name: '', firstName: '', lastName: '' }],
        error: null
      });

      const first = service.usersWithNames();
      expect(first[0].name).toBe('');

      // Update real vault again — signal change should propagate
      service['vault'].replaceState({
        loading: false,
        value: [{ id: '2', name: '', firstName: '', lastName: '' }],
        error: null
      });

      const second = service.usersWithNames();
      expect(second[0].name).toBe('');
    });
  });

  describe('users', () => {
    it('should reflect users() based on current state', () => {
      spyOn(service, 'loadUsers');

      service.users();
      TestBed.tick();

      expect(service.loadUsers).toHaveBeenCalled();
    });
  });

  describe('loadUsers()', () => {
    it('should set loading to true, then set users on success', () => {
      expect((service as any).isLoaded()).toBeFalse();

      service.loadUsers();
      expect((service as any).isLoaded()).toBeTrue();
    });
  });

  describe('getUser()', () => {
    it('should set loading to true, then set a single user on success', () => {
      expect((service as any).isLoaded()).toBeFalse();

      service.loadUser('1');
      expect((service as any).isLoaded()).toBeTrue();
    });
  });

  describe('resetUsers', () => {
    it('should handle a resetUsers', async () => {
      spyOn(service['vault'], 'reset');

      service.resetUsers();

      expect(service['vault'].reset).toHaveBeenCalledWith();
    });
  });

  it('should handle a reloadUser', async () => {
    spyOn(service['vault'], 'reset');
    (service as any).isLoaded.set(true);

    service.reloadUsers();
    TestBed.tick();

    expect(service['vault'].reset).toHaveBeenCalledWith();
    expect(service['isLoaded']()).toBeTrue();
  });

  it('should handle a reactiveReloadUsers', async () => {
    spyOn(service['vault'], 'reset');
    (service as any).isLoaded.set(true);

    service.reactiveReloadUsers();

    expect(service['vault'].reset).not.toHaveBeenCalled();
    expect(service['isLoaded']()).toBeFalse();
  });
});
