import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavigationService } from '../navigation/service/navigation.service';
import { ThemeService } from '../theme/theme.service';
import { ToolbarComponent } from './toolbar.component';

describe('Component: Toolbar', () => {
  let fixture: ComponentFixture<ToolbarComponent>;
  let component: ToolbarComponent;
  let themeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    const themeSpy = jasmine.createSpyObj<ThemeService>('ThemeService', ['toggleTheme', 'toggleDirection'], {
      theme: signal<'light' | 'dark'>('light'),
      direction: signal<'ltr' | 'rtl'>('ltr')
    });

    await TestBed.configureTestingModule({
      imports: [ToolbarComponent],
      providers: [{ provide: ThemeService, useValue: themeSpy }, provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    fixture.detectChanges();
  });

  it('should openNavigation', () => {
    const navigationService = TestBed.inject(NavigationService);
    spyOn(navigationService, 'show');
    component.openNavigation();
    expect(navigationService.show).toHaveBeenCalledWith();
  });

  it('should expose default computed values for light/LTR state', () => {
    expect(component.theme()).toBe('light');
    expect(component.direction()).toBe('ltr');
    expect(component.themeIcon()).toBe('dark_mode');
    expect(component.themeLabel()).toBe('Dark Mode');
    expect(component.dirIcon()).toBe('format_textdirection_r_to_l');
    expect(component.dirLabel()).toBe('Switch to RTL');
  });

  it('should update computed signals when theme changes to dark', () => {
    themeService.theme.set('dark');
    fixture.detectChanges();

    expect(component.theme()).toBe('dark');
    expect(component.themeIcon()).toBe('light_mode');
    expect(component.themeLabel()).toBe('Light Mode');
  });

  it('should update computed signals when direction changes to rtl', () => {
    themeService.direction.set('rtl');
    fixture.detectChanges();

    expect(component.direction()).toBe('rtl');
    expect(component.dirIcon()).toBe('format_textdirection_l_to_r');
    expect(component.dirLabel()).toBe('Switch to LTR');
  });

  it('should call ThemeService.toggleTheme() when toggleTheme() is invoked', () => {
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should call ThemeService.toggleDirection() when toggleDirection() is invoked', () => {
    component.toggleDirection();
    expect(themeService.toggleDirection).toHaveBeenCalled();
  });
});
