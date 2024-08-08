import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { InventarioDialogComponent } from '../inventario-dialog/inventario-dialog.component';
import { GetFoldersService } from '../services/get-folders.service';

@Component({
  selector: 'app-inventario-list',
  templateUrl: 'inventario-list.component.html',
  styleUrls: ['inventario-list.component.css'],
})
export class InventarioListComponent implements OnInit {
  folders: string[] = [];
  directoryPath: string = 'datasets/analitos2';

  constructor(
    private notificationService: NotificationService,
    private titleService: Title,
    public dialog: MatDialog,
    private getFoldersService: GetFoldersService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Inventario');
    this.notificationService.openSnackBar('Inventario carregado');
  }

  getFolders(): void {
    if (this.directoryPath.trim()) {
      this.getFoldersService
        .getFolders(this.directoryPath)
        .subscribe((data) => {
          this.folders = data;
        });
    } else {
      console.warn('Insira um caminha de diretorio valido');
    }
  }

  clearFolders() {
    this.folders = [];
    this.directoryPath = '';
  }

  openDialog(folderName: string): void {
    const selectedFolder = `${this.directoryPath}/${folderName}`;
    this.getFoldersService.getImages(selectedFolder).subscribe((images) => {
      this.dialog.open(InventarioDialogComponent, {
        data: { images, directoryPath: selectedFolder },
        width: '500px',
      });
    });
  }
}
