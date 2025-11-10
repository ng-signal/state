import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExampleViewerService {
  private readonly _visibilityMap = new Map<string, ReturnType<typeof signal<boolean>>>();

  /** Returns a signal controlling visibility for a given exampleId */
  getVisibilitySignal(exampleId: string) {
    if (!this._visibilityMap.has(exampleId)) {
      this._visibilityMap.set(exampleId, signal(false)); // hidden by default
    }
    return this._visibilityMap.get(exampleId)!;
  }

  toggle(exampleId: string): void {
    const sig = this.getVisibilitySignal(exampleId);
    sig.update((v) => !v);
  }

  show(exampleId: string): void {
    this.getVisibilitySignal(exampleId).set(true);
  }

  setDefaultVisibility(exampleId: string, isVisible: boolean): void {
    const sig = this.getVisibilitySignal(exampleId);
    sig.set(isVisible);
  }

  hide(exampleId: string): void {
    this.getVisibilitySignal(exampleId).set(false);
  }
}
