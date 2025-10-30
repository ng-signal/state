import { HttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideState, provideStore } from '@ngss/state';
import { UserStateModel } from './models/user-state.model';
import { UserStateService } from './user-state.service';

describe('UserStateService (consumer test)', () => {
  let service: UserStateService;
  let mockHttp: jasmine.SpyObj<HttpClient>;

  const initialState: UserStateModel = {
    loading: false,
    entities: {
      a: { id: 'a', name: 'Alice' },
      b: { id: 'b', name: 'Bob' }
    },
    error: null
  };

  beforeEach(() => {
    mockHttp = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideStore(), // ✅ sets up STORE_ROOT + registry
        provideState(UserStateService, { key: 'user', initial: initialState }), // ✅ creates vault + service
        { provide: HttpClient, useValue: mockHttp }
      ]
    });

    service = TestBed.inject(UserStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should remove a user by ID', () => {
    // Arrange — ensure initial state exists
    const vaultStateBefore = service.state();
    expect(Object.keys(vaultStateBefore.entities)).toContain('a');

    // Act
    service.remove('a');

    // Assert
    const vaultStateAfter = service.state();
    expect(vaultStateAfter.entities['a']).toBeUndefined();
    expect(Object.keys(vaultStateAfter.entities)).toEqual(['b']);
  });
});
