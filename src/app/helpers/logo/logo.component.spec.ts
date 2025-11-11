import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NgvaultLogoComponent } from './logo.component';

describe('NgvaultLogoComponent', () => {
  let fixture: ComponentFixture<NgvaultLogoComponent>;
  let component: NgvaultLogoComponent;

  const getImg = () => fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  describe('standard tests', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [NgvaultLogoComponent],
        providers: [provideZonelessChangeDetection()]
      });

      fixture = TestBed.createComponent(NgvaultLogoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('logo', 'ngvault.svg');
      fixture.detectChanges();
    });

    it('should render default light logo with default tooltip', () => {
      const img = getImg();

      expect(img.getAttribute('src')).toContain('assets/brand/ngvault.svg');
      expect(img.getAttribute('alt')).toBe('ngVault');
      expect(img.getAttribute('aria-label')).toBe('ngVault');
      expect(img.getAttribute('role')).toBe('img');
      expect(img.getAttribute('class')).toContain('ngvault-logo');

      const tooltipDirective = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
      expect(tooltipDirective.message).toBe('ngVault');

      expect(img.width).toBe(0);
      expect(img.height).toBe(0);
    });

    it('should respect inputs changes', () => {
      const img = getImg();

      expect(img.getAttribute('src')).toContain('assets/brand/ngvault.svg');
      expect(img.getAttribute('alt')).toBe('ngVault');
      expect(img.getAttribute('aria-label')).toBe('ngVault');
      expect(img.getAttribute('role')).toBe('img');
      expect(img.getAttribute('class')).toContain('ngvault-logo');

      const tooltipDirective = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
      expect(tooltipDirective.message).toBe('ngVault');

      expect(img.width).toBe(0);
      expect(img.height).toBe(0);

      // The updates

      fixture.componentRef.setInput('logo', 'changed.png');
      fixture.componentRef.setInput('tooltip', 'Secure State Demo');
      fixture.componentRef.setInput('width', 300);
      fixture.componentRef.setInput('height', 120);
      fixture.detectChanges();

      expect(img.width).toBe(300);
      expect(img.height).toBe(120);
      expect(img.getAttribute('alt')).toBe('Secure State Demo');
      expect(img.getAttribute('aria-label')).toBe('Secure State Demo');
      expect(tooltipDirective.message).toBe('Secure State Demo');
      expect(img.getAttribute('src')).toContain('assets/brand/changed.png');
      expect(img.getAttribute('role')).toBe('img');
      expect(img.getAttribute('class')).toContain('ngvault-logo');

      // The updates

      fixture.componentRef.setInput('tooltip', '');
      fixture.detectChanges();

      expect(img.width).toBe(300);
      expect(img.height).toBe(120);
      expect(img.getAttribute('alt')).toBe('ngVault Logo');
      expect(img.getAttribute('aria-label')).toBe('');
      expect(tooltipDirective.message).toBe('');
      expect(img.getAttribute('src')).toContain('assets/brand/changed.png');
      expect(img.getAttribute('role')).toBe('img');
      expect(img.getAttribute('class')).toContain('ngvault-logo');
    });

    it('should resolve dark variant when theme is dark', async () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      fixture.detectChanges();

      // Wait for MutationObserver → signal → computed chain to settle
      await fixture.whenStable();
      await new Promise((r) => setTimeout(r));

      const img = getImg();
      expect(img.getAttribute('src')).toContain('ngvault-dark.svg');
    });

    it('should not add -dark twice if already dark logo', async () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      fixture.componentRef.setInput('logo', 'ngvault-dark.svg');
      fixture.detectChanges();

      await fixture.whenStable();
      await new Promise((r) => setTimeout(r));

      const img = getImg();
      expect(img.getAttribute('src')).toContain('ngvault-dark.svg');
      expect(img.getAttribute('src')).not.toContain('dark-dark');
    });
  });

  describe('NgvaultLogoComponent', () => {
    beforeEach(() => {
      spyOn(window, 'matchMedia').and.returnValue({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {}
      } as any);

      TestBed.configureTestingModule({
        imports: [NgvaultLogoComponent],
        providers: [provideZonelessChangeDetection()]
      });

      fixture = TestBed.createComponent(NgvaultLogoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('logo', 'ngvault.svg');
      fixture.detectChanges();
    });

    afterEach(() => {
      document.documentElement.removeAttribute('data-theme');
    });

    it('should fall back to prefers-color-scheme: dark when no theme', async () => {
      (window.matchMedia as jasmine.Spy).and.returnValue({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {}
      } as any);

      (component as any).syncTheme();
      fixture.detectChanges();

      await fixture.whenStable();
      await new Promise((r) => setTimeout(r));

      const img = getImg();
      expect(img.getAttribute('src')).toContain('ngvault-dark.svg');
    });
  });
});
