import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { getCarData } from './data/car.data';
import { getUserData } from './data/user.data';

/**
 * Mock in-memory API for development and demos.
 *
 * Simulates backend endpoints for users and cars.
 */
@Injectable()
export class MockApiService implements InMemoryDbService {
  createDb() {
    return { users: getUserData(), cars: getCarData() };
  }
}
