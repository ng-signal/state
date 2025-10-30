import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NGSSComponent } from './ngss.component';

describe('Component: NGSS', () => {
  let fixture: ComponentFixture<NGSSComponent>;
  let component: NGSSComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NGSSComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(NGSSComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should render default variables', () => {
    expect(component.title).toBe('NGSS (Signal Store) Demo');
    expect(component.opened).toBeTrue();
  });
});
