import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { flushMicrotasksZoneless } from '@ngvault/testing';
import { NgVaultDevtoolsPanelComponent } from './ngvault-devtools-panel.component';
import { NgVaultDevtoolsService } from './services/ngvault-devtools.service';

describe('Component: NgVaultDevtoolsPanel', () => {
  let fixture: ComponentFixture<NgVaultDevtoolsPanelComponent>;
  let component: NgVaultDevtoolsPanelComponent;
  let service: NgVaultDevtoolsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgVaultDevtoolsPanelComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(NgVaultDevtoolsPanelComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NgVaultDevtoolsService);

    fixture.detectChanges();
  });

  it('should render events and vaults from signals', async () => {
    // Arrange — push a fake event and vault
    service.events.set([
      {
        id: '1',
        cell: 'user',
        type: 'set',
        source: 'manual',
        timestamp: Date.now(),
        payload: { id: 1, name: 'Ada' }
      } as any
    ]);

    // Act — trigger Angular change detection
    await flushMicrotasksZoneless();

    // Assert — verify the rendered HTML includes both
    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('user');
  });

  it('should clear events when clearEvents() is called', async () => {
    service.events.set([
      { id: '1', key: 'user', type: 'set', timestamp: Date.now(), source: 'manual', payload: {} } as any
    ]);
    expect(service.events().length).toBe(1);
    await flushMicrotasksZoneless();

    component.clearEvents();
    expect(service.events()).toEqual([]);
  });

  it('should update view reactively when signals change', async () => {
    // Initially nothing
    fixture.detectChanges();
    let html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).not.toContain('Grace');

    // Push reactive update
    service.events.set([
      {
        id: '2',
        key: 'user',
        type: 'patch',
        source: 'manual',
        timestamp: Date.now(),
        state: { id: 2, name: 'Grace' }
      } as any
    ]);

    await flushMicrotasksZoneless();
    html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Grace');
  });
});
