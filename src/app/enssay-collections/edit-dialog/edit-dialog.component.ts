import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface FolderData {
  name: string;
  description: string;
  nameFolder: string;
}

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.css']
})
export class EditDialogComponent {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FolderData
  ) {
    // Inicializa o form já com os valores passados em `data`
    this.form = this.fb.group({
      name: [data.name, [Validators.required, Validators.maxLength(100)]],
      description: [data.description, [Validators.required, Validators.maxLength(200)]],
    });
  }

  onCancel(): void {
    this.dialogRef.close(); // fecha sem retorno
  }

  onSave(): void {
    if (this.form.valid) {
      // envia de volta um objeto com os valores atualizados
      this.dialogRef.close(this.form.value);
    }
  }
  
}
