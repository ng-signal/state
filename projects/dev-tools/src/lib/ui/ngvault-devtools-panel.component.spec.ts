import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultDevtoolsPanelComponent } from './ngvault-devtools-panel.component';
import { NgVaultDevtoolsService } from './services/ngvault-devtools.service';

// 🧪 Mock service
class MockNgVaultDevtoolsService {
  events = signal<NgVaultEventModel[]>([
    { key: 'alpha', type: 'init', source: 'system', timestamp: Date.now(), payload: { ok: true } }
  ]);
}

describe('Component: NgVaultDevtoolsPanel', () => {
  let fixture: ComponentFixture<NgVaultDevtoolsPanelComponent>;
  let component: NgVaultDevtoolsPanelComponent;
  let mockService: MockNgVaultDevtoolsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgVaultDevtoolsPanelComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: NgVaultDevtoolsService, useClass: MockNgVaultDevtoolsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgVaultDevtoolsPanelComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(NgVaultDevtoolsService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose events from the devtools service', () => {
    const initial = component.events();
    expect(Array.isArray(initial)).toBeTrue();
    expect(initial.length).toBe(1);
    expect(initial[0].key).toBe('alpha');
  });

  it('should update computed events when service events change', () => {
    mockService.events.set([
      { key: 'beta', type: 'patch', source: 'manual', timestamp: Date.now(), payload: { test: true } }
    ]);

    fixture.detectChanges(); // triggers reactivity
    const updated = component.events();

    expect(updated.length).toBe(1);
    expect(updated[0].key).toBe('beta');
    expect(updated[0].type).toBe('patch');
  });
});
