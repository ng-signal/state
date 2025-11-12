import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

export const flushMicrotasksZoneless = async (iterations = 6) => {
  const appRef = TestBed.inject(ApplicationRef);

  for (let i = 0; i < iterations; i++) {
    await Promise.resolve();
  }
  await appRef.whenStable();
};
