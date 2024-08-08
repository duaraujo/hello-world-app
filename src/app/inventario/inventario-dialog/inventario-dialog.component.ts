import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteImageService } from '../services/delete-image.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inventrario-dialog',
  templateUrl: 'inventario-dialog.component.html',
  styleUrls: ['inventario-dialog.component.css']
})
export class InventarioDialogComponent implements OnInit {
  currentIndex: number = 0;

  constructor(
    public dialogRef: MatDialogRef<InventarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) 
    public data: { 
      images: { name: string; base64: string }[],
      directoryPath: string },
    private deleteImageService: DeleteImageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    
  }
  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.data.images.length - 1) {
      this.currentIndex++;
    }
  }

  removeImage(): void {
    const imageName = this.data.images[this.currentIndex].name;
    const directoryPath = this.data.directoryPath;

    this.deleteImageService.deleteImage(directoryPath, imageName).subscribe({
      next: () => {
        this.snackBar.open('Imagem removida com sucesso', 'Fechar', { duration: 3000 });
        this.data.images.splice(this.currentIndex, 1);
        if (this.currentIndex >= this.data.images.length) {
          this.currentIndex = this.data.images.length - 1;
        }
        if (this.data.images.length === 0) {
          this.dialogRef.close();
        }
      },
      error: () => {
        this.snackBar.open('Erro ao remover imagem', 'Fechar', { duration: 3000 });
      },
    });
  }

}
