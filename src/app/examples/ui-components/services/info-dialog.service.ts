import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';

@Injectable({ providedIn: 'root' })
export class InfoDialogService {
  private dialog = inject(MatDialog);

  // eslint-disable-next-line
  open(data: any): void {
    this.dialog.open(InfoDialogComponent, {
      width: '400px',
      data,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'info-dialog-panel'
    });
  }
}
