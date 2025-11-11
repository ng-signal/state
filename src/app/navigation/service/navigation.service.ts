import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private open: WritableSignal<boolean> = signal<boolean>(false);

  public readonly isOpen: Signal<boolean> = this.open.asReadonly();

  public show(): void {
    this.open.set(true);
  }
}
