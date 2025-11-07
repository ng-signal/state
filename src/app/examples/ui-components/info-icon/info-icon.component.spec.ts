import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InfoDialogService } from '../services/info-dialog.service';
import { InfoIconComponent } from './info-icon.component';

describe('Component: InfoIcon', () => {
  let fixture: ComponentFixture<InfoIconComponent>;
  let component: InfoIconComponent;
  let mockDialogService: jasmine.SpyObj<InfoDialogService>;

  describe('No Data', () => {
    beforeEach(async () => {
      mockDialogService = jasmine.createSpyObj('InfoDialogService', ['open']);

      await TestBed.configureTestingModule({
        imports: [InfoIconComponent],
        providers: [provideZonelessChangeDetection(), { provide: InfoDialogService, useValue: mockDialogService }]
      }).compileComponents();

      fixture = TestBed.createComponent(InfoIconComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('data', { id: 1, name: 'Ada Lovelace' });
      fixture.detectChanges();
    });

    it('should render the default info icon when no icon input is set', () => {
      const iconEl = fixture.debugElement.query(By.css('mat-icon')).nativeElement;
      expect(iconEl.textContent.trim()).toBe('info');
    });

    it('should default variables', () => {
      expect(component.displayClass()).toBe('icon-class');
      expect(component.displayOverlay()).toBeFalse();
      expect(component.displayIcon()).toBe('info');
    });

    it('should call InfoDialogService.open() when open() is called', () => {
      component.open();
      expect(mockDialogService.open).toHaveBeenCalledWith({ id: 1, name: 'Ada Lovelace' });
    });

    it('should open the dialog when icon element is clicked', () => {
      const iconEl = fixture.debugElement.query(By.css('mat-icon')).nativeElement;
      iconEl.click();

      expect(mockDialogService.open).toHaveBeenCalledTimes(1);
      expect(mockDialogService.open).toHaveBeenCalledWith({ id: 1, name: 'Ada Lovelace' });
    });
  });

  describe('Data', () => {
    beforeEach(async () => {
      mockDialogService = jasmine.createSpyObj('InfoDialogService', ['open']);

      await TestBed.configureTestingModule({
        imports: [InfoIconComponent],
        providers: [provideZonelessChangeDetection(), { provide: InfoDialogService, useValue: mockDialogService }]
      }).compileComponents();

      fixture = TestBed.createComponent(InfoIconComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('icon', 'no_cars_custom');
      fixture.componentRef.setInput('data', { id: 1, name: 'Ada Lovelace' });
      fixture.detectChanges();
    });

    it('should default variables', () => {
      expect(component.displayClass()).toBe('icon-class overlay');
      expect(component.displayOverlay()).toBeTrue();
      expect(component.displayIcon()).toBe('directions_car');
    });

    it('should render the provided custom icon input', () => {
      const iconEl = fixture.debugElement.query(By.css('mat-icon')).nativeElement;
      expect(iconEl.textContent.trim()).toBe('directions_car');
    });
  });
});
