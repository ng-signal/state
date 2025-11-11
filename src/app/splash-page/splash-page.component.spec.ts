import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { provideFeatureCell } from '@ngvault/core';
import { provideVaultTesting } from '@ngvault/testing';
import { CarService } from '../examples/cars/services/car.service';
import { UserCellManualService } from '../examples/users/user-cell-manual/services/user-cell-manual.service';
import { NavigationService } from '../navigation/service/navigation.service';
import { SplashPageComponent } from './splash-page.component';

describe('Component: Splash Page', () => {
  let component: SplashPageComponent;
  let fixture: ComponentFixture<SplashPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIconModule, SplashPageComponent],
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideFeatureCell(UserCellManualService, { key: 'userManual', initial: [] }, []),
        provideFeatureCell(CarService, { key: 'cars', initial: [] }, [])
      ]
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
      Object({ type: 'model', label: 'MODEL', code: jasmine.any(String) }),
      Object({ type: 'data', label: 'DATA', code: jasmine.any(String) })
    ]);
  });

  it('should open the navigation menu', () => {
    const service = TestBed.inject(NavigationService);
    spyOn(service, 'show');
    component.openMenu();
    expect(service.show).toHaveBeenCalledWith();
  });
});
