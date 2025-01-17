import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateJsonService } from '../services/update-json.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-update-dialog',
  templateUrl: './update-dialog.component.html',
  styleUrls: ['./update-dialog.component.css']
})
export class UpdateDialogComponent implements OnInit {

  fileForm: FormGroup;
  formKeys: string[] = [];


  constructor(
    public dialogRef: MatDialogRef<UpdateDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public fileData: any,
    private updateService: UpdateJsonService,
    private snackBar: MatSnackBar,
  ) {
    this.fileForm = this.fb.group({});
   }

  ngOnInit(): void {
    this.extractData(this.fileData.data);
  }

  extractData(data: any, parentKey: string = ''): void {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const controlKey = parentKey ? `${parentKey}.${key}` : key;
        const value = data[key];

        if (typeof value === 'object' && value !== null) {
          this.extractData(value, controlKey);
        } else {
          this.formKeys.push(controlKey);
          this.fileForm.addControl(controlKey, this.fb.control(value));
        }
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  update(): void {
    const fileContent = this.fileForm.value;

    const fileName = 'Data.json'; 
    const urlPath = this.fileData.urlPath;

    this.updateService.updateFile(fileName, fileContent, urlPath).subscribe({
      next: () => {
        this.snackBar.open('Arquivo atualizado com sucesso', 'Fechar', { duration: 3000 });
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.open('Erro ao atualizar arquivo', 'Fechar', { duration: 3000 });
        console.error('Erro ao atualizar arquivo:', err);
      },
    });
  }

}
