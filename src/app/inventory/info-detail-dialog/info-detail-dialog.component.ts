import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteImageService } from 'src/app/inventario/services/delete-image.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-info-detail-dialog',
  templateUrl: './info-detail-dialog.component.html',
  styleUrls: ['./info-detail-dialog.component.css'],
})
export class InfoDetailDialogComponent implements OnInit {
  currentIndex: number = 0;
  images: string[] = [];
  isTextView: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private deleteImageService: DeleteImageService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<InfoDetailDialogComponent>,
    public dialogRefConfirmDelete: MatDialogRef<ConfirmDeleteDialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.data.images.sample.fileName) {
      this.images.push(this.data.images.sample.fileName);
    }
    if (
      this.data.images.sample.extraFileNamesBase64 != null &&
      this.data.images.sample.extraFileNamesBase64.length > 0
    ) {
      this.images.push(...this.data.images.sample.extraFileNamesBase64);
      this.data.images.sample.extraFileNames.unshift(
        this.data.images.sample.title
      );
    }
  }

  previous(): void {
    if (this.isTextView) return; // Não faz nada se estiver na visualização de texto
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.isTextView = true; // Volta para a tela de texto
    }
  }

  next(): void {
    if (this.isTextView) {
      this.isTextView = false; // Avança para a primeira imagem
    } else if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
  }

  removeImage(): void {
    const dialogRefConfirmDelete = this.dialog.open(
      ConfirmDeleteDialogComponent
    );

    dialogRefConfirmDelete.afterClosed().subscribe((result) => {
      if (result) {
        const imageName =
          this.data.images.sample.extraFileNames[this.currentIndex];
        const directoryPath = `${this.data.directoryPath}`;
        const fileJson = this.data.images.sample.title;
        const newFilename = fileJson.replace(/\.[^/.]+$/, '.json');

        this.deleteImageService
          .deleteImage(directoryPath, imageName, newFilename)
          .subscribe({
            next: () => {
              this.snackBar.open('Imagem removida com sucesso', 'Fechar', {
                duration: 3000,
              });

              this.images.splice(this.currentIndex, 1);
              this.data.images.sample.extraFileNames.splice(this.currentIndex, 1);

              if (this.currentIndex >= this.images.length) {
                this.currentIndex = this.images.length - 1;
              }
              if (this.images.length === 0) {
                this.dialogRef.close();
              }
            },
            error: () => {
              this.snackBar.open('Erro ao remover imagem', 'Fechar', {
                duration: 3000,
              });
            },
          });
      }
    });
  }
}
