import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { UserModel } from 'src/app/examples/models/user.model';

/**
 * Mock in-memory API for development and demos.
 *
 * Simulates backend endpoints for users and returns mock data.
 */
@Injectable()
export class MockApiService implements InMemoryDbService {
  createDb() {
    const users: UserModel[] = [
      { id: '1', name: 'Ada Lovelace' },
      { id: '2', name: 'Alan Turing' },
      { id: '3', name: 'Grace Hopper' }
    ];

    return { users };
  }
}
