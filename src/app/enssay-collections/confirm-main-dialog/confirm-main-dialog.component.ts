import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-main-dialog',
  templateUrl: './confirm-main-dialog.component.html',
  styleUrls: ['./confirm-main-dialog.component.css']
})
export class ConfirmMainDialogComponent {


  constructor(public dialogRef: MatDialogRef<ConfirmMainDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true); // Retorna 'true' para confirmar a exclusão
  }

  onCancel(): void {
    this.dialogRef.close(false); // Retorna 'false' para cancelar a exclusão
  }

}
