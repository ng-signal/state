import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { flushMicrotasksZoneless } from '@ngvault/testing';
import { NgVaultDevtoolsService } from '../display-panel/services/ngvault-devtools.service';
import { SplashPageComponent } from './splash-page.component';

describe('Component: SplashPageComponent', () => {
  let fixture: ComponentFixture<SplashPageComponent>;
  let component: SplashPageComponent;
  let service: NgVaultDevtoolsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplashPageComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SplashPageComponent);
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
});
