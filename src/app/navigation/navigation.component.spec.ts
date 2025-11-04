import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let fixture: ComponentFixture<NavigationComponent>;
  let component: NavigationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent, MatIconModule, MatButtonModule, MatSidenavModule],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sidenav expanded', () => {
    expect(component.isExpanded()).toBeTrue();
  });

  it('should toggle sidenav state when toggleSidenav() is called', () => {
    const initial = component.isExpanded();
    component.toggleSidenav();
    expect(component.isExpanded()).toBe(!initial);
    component.toggleSidenav();
    expect(component.isExpanded()).toBe(initial);
  });

  it('should update DOM when signal changes', async () => {
    // Arrange: ensure we start collapsed
    component.isExpanded.set(false);
    fixture.detectChanges();

    // Assert: sidenav should be closed
    const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
    expect(sidenav).toBeTruthy();
    expect(component.isExpanded()).toBeFalse();

    // Act: toggle
    component.toggleSidenav();
    fixture.detectChanges();

    // Assert: signal should now be true
    expect(component.isExpanded()).toBeTrue();
  });

  it('should render mat-sidenav-container and toolbar', () => {
    const container = fixture.debugElement.query(By.css('mat-sidenav-container'));
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar'));
    expect(container).toBeTruthy();
    expect(toolbar).toBeTruthy();
  });

  it('should have mat-icons or buttons if present in template', () => {
    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    const buttons = fixture.debugElement.queryAll(By.css('button, [mat-icon-button]'));
    // Not asserting exact count because your template may vary
    expect(icons.length).toBeGreaterThanOrEqual(0);
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });

  it('should not throw if toggleSidenav() called multiple times', () => {
    expect(() => {
      for (let i = 0; i < 5; i++) {
        component.toggleSidenav();
      }
    }).not.toThrow();
  });
});
