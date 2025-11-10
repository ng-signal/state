import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { SplashPageComponent } from './splash-page.component';

describe('Component: Splash Page', () => {
  let component: SplashPageComponent;
  let fixture: ComponentFixture<SplashPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, SplashPageComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SplashPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have appName defined and correct', () => {
    expect(component.userListSourceCode).toEqual([
      Object({ type: 'html', label: 'HTML', code: jasmine.any(String) }),
      Object({ type: 'component', label: 'COMPONENT', code: jasmine.any(String) }),
      Object({ type: 'service', label: 'SERVICE', code: jasmine.any(String) }),
      Object({ type: 'model', label: 'MODEL', code: jasmine.any(String) })
    ]);
  });
});
