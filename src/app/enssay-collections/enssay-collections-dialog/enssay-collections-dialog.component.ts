import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from 'src/app/inventory/confirm-delete-dialog/confirm-delete-dialog.component';
import { DeleteImageService } from '../services/delete-image.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmMainDialogComponent } from '../confirm-main-dialog/confirm-main-dialog.component';

@Component({
  selector: 'app-enssay-collections-dialog',
  templateUrl: './enssay-collections-dialog.component.html',
  styleUrls: ['./enssay-collections-dialog.component.css'],
})
export class EnssayCollectionsDialogComponent implements OnInit {
  currentIndex: number = 0;
  images: any[] = [];
  isTextView: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogDelete: MatDialog,
    private dialogMain: MatDialog,
    private deleteImageService: DeleteImageService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EnssayCollectionsDialogComponent>
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    if (this.data.images != null && this.data.images.length > 0) {
      this.images = this.data.images;

      // this.images = this.data.images.map((obj: any) => {
      //   return obj.base64
      // })
      //console.log(this.images);
      //this.images.push(...this.data.images.base64);
      // this.data.images.sample.extraFileNames.unshift(
      //   this.data.images.sample.title
      // );
    }
  }

  previous(): void {
    //if (this.isTextView) return; // Não faz nada se estiver na visualização de texto
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    // else {
    //   this.isTextView = true; // Volta para a tela de texto
    // }
  }

  next(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
    // if (this.isTextView) {
    //   this.isTextView = false; // Avança para a primeira imagem
    // } else if (this.currentIndex < this.images.length - 1) {
    //   this.currentIndex++;
    // }
  }

  removeImage() {
    const dialogRefConfirmDelete = this.dialogDelete.open(
      ConfirmDeleteDialogComponent
    );

    dialogRefConfirmDelete.afterClosed().subscribe((result) => {
      if (result) {
        const imageName = this.data.images[this.currentIndex];
        this.deleteImageService
          .deleteImage(this.data.directoryPath, imageName.name)
          .subscribe({
            next: () => {
              this.snackBar.open('Imagem removida com sucesso', 'Fechar', {
                duration: 3000,
              });
              this.images.splice(this.currentIndex, 1);

              if (this.currentIndex >= this.images.length) {
                this.currentIndex = this.images.length - 1;
              }
              if (this.images.length === 0) {
                this.dialogRef.close();
              }
            },
          });
      }
    });
  }

  definirPrincipal() {
    const dialogRefConfirmMain = this.dialogMain.open(
      ConfirmMainDialogComponent
    );

    dialogRefConfirmMain.afterClosed().subscribe((result) => {
      if (result) {
        const imageName = this.data.images[this.currentIndex];

        this.deleteImageService.
        promoteImage(this.data.directoryPath, imageName.name)
        .subscribe({
          next: () => {
            this.snackBar.open('Imagem promovida com sucesso', 'Fechar', {
              duration: 3000,
            });
            this.images.splice(this.currentIndex, 1);     
            this.dialogRef.close();       
          },
        });
      }
    });
  }

}
