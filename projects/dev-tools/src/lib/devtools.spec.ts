import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Devtools } from './devtools';

describe('Devtools', () => {
  let component: Devtools;
  let fixture: ComponentFixture<Devtools>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Devtools]
    }).compileComponents();

    fixture = TestBed.createComponent(Devtools);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
