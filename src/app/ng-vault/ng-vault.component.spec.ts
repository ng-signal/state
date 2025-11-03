import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgVaultComponent } from './ng-vault.component';

describe('Component: ngVault', () => {
  let fixture: ComponentFixture<NgVaultComponent>;
  let component: NgVaultComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgVaultComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(NgVaultComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should render default variables', () => {
    expect(component.title).toBe('NgVault (Signal Service Storage) Demo');
    expect(component.opened).toBeTrue();
  });
});
