import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { Devtools } from './devtools';

describe('Devtools', () => {
  let component: Devtools;
  let fixture: ComponentFixture<Devtools>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Devtools],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(Devtools);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
