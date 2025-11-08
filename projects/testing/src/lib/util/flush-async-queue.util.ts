import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

export const flushNgVaultQueue = async (iterations = 1) => {
  const appRef = TestBed.inject(ApplicationRef);

  for (let i = 0; i < iterations; i++) {
    await appRef.whenStable();
  }
};
