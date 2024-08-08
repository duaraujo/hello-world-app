import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateFileService } from '../services/create-file.service';

@Component({
  selector: 'app-file-dialog',
  templateUrl: './file-dialog.component.html',
  styleUrls: ['./file-dialog.component.css']
})
export class FileDialogComponent implements OnInit {

  fileForm: FormGroup;
  formKeys: string[] = [];
  
  constructor(
    public dialogRef: MatDialogRef<FileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public fileData: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private createFileService: CreateFileService
  ) {
    this.fileForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.extractData(this.fileData);
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

  create(): void {
    const fileContent = this.fileForm.value;

    const fileName = 'novo_arquivo.json'; 
    const urlPath = 'datasets';

    this.createFileService.createFile(fileName, fileContent, urlPath).subscribe({
      next: () => {
        this.snackBar.open('Arquivo criado com sucesso', 'Fechar', { duration: 3000 });
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.open('Erro ao criar arquivo', 'Fechar', { duration: 3000 });
        console.error('Erro ao criar arquivo:', err);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  update() {

  }

}
