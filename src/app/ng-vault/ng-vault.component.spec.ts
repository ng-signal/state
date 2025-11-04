import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '../theme/theme.service';
import { NgVaultComponent } from './ng-vault.component';

// Dummy stubs for the imported standalone components
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { LoadingSpinnerComponent } from '../spinner/loading-spinner.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';

describe('Component: NgVault', () => {
  let fixture: ComponentFixture<NgVaultComponent>;
  let component: NgVaultComponent;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgVaultComponent, ToolbarComponent, NavigationComponent, FooterComponent, LoadingSpinnerComponent],
      providers: [ThemeService, provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    themeService = TestBed.inject(ThemeService);
    spyOn(themeService, 'restorePreferences'); // 👈 Spy before component creation

    fixture = TestBed.createComponent(NgVaultComponent);
    component = fixture.componentInstance;
  });

  it('should be truthy', () => {
    expect(component).toBeTruthy();
  });

  it('should call ThemeService.restorePreferences once on initialization', () => {
    expect(themeService.restorePreferences).toHaveBeenCalledTimes(1);
  });
});
