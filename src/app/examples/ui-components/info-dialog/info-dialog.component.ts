import { JsonPipe, KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngvault-info-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, KeyValuePipe, JsonPipe],
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent {
  public data = inject(MAT_DIALOG_DATA);

  private dialogRef = inject(MatDialogRef<InfoDialogComponent>);

  close() {
    this.dialogRef.close();
  }
}
