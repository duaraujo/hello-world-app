import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NewGetFoldersService } from '../services/new-get-folders.service';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { FileService } from '../services/file.service';
import { Router } from '@angular/router';
import {
  EditDialogComponent,
  FolderData,
} from '../edit-dialog/edit-dialog.component';
import { UpdateJsonService } from '../services/update-json.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-enssay-collections',
  templateUrl: './enssay-collections.component.html',
  styleUrls: ['./enssay-collections.component.css'],
})
export class EnssayCollectionsComponent implements OnInit, AfterViewInit {
  folderSelected = '';
  filterControl = new FormControl();
  files: any[] = [];
  folders: any[] = [];

  constructor(
    private getFoldersService: NewGetFoldersService,
    public dialog: MatDialog,
    private updateJson: UpdateJsonService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getFolders();
    });
  }

  getFolders(): void {
    this.getFoldersService.getFolders().subscribe((data: any[]) => {
      this.folders = data;
    });
  }

  download(path: string) {
    this.getFoldersService.download(path).subscribe(
      (file: Blob) => {
        saveAs(file, 'arquivo.zip');
      },
      (error) => {
        console.error('Erro ao baixar o arquivo:', error);
      }
    );
  }

  open(element: any) {
    this.folderSelected = element.nameFolder;
    this.router.navigate([
      '/enssay/analitos',
      element.nameFolder,
      element.name,
    ]);
  }

  edit(element: any) {
    const dataToSend: FolderData = {
      name: element.name,
      description: element.description,
      nameFolder: element.nameFolder,
    };

    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '400px',
      data: dataToSend,
    });

    dialogRef.afterClosed().subscribe((result: FolderData | undefined) => {
      if (result) {
        this.updateJson
          .updateFile(dataToSend.nameFolder, result.name, result.description)
          .subscribe({
            next: (resp) => {
              element.name = result.name;
              element.description = result.description;
              this.snackBar.open('Coleção atualizada com sucesso', 'Fechar', {
                duration: 3000,
                panelClass: ['custom-success'],
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
            },
            error: (err) => {
              console.error('Falha ao atualizar JSON:', err);
            },
          });
      } else {
        console.log('Edição cancelada');
      }
    });
  }
}
