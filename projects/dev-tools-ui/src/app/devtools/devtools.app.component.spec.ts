import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultDevToolsApp } from './devtools.app.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgVaultDevToolsApp],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(NgVaultDevToolsApp);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
