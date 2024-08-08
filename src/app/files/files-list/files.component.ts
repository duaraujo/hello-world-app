import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FileService } from '../services/file.service';
import { FileDialogComponent } from '../file-dialog/file-dialog.component';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css'],
})
export class FilesComponent implements OnInit {
  files: any[] = [];
  displayedColumns: string[] = ['fileName', 'actions'];
  dataSource = new MatTableDataSource(this.files);

  @ViewChild(MatSort, { static: true })
  sort: MatSort = new MatSort();

  directoryPath: string = 'datasets/arquivos';
  constructor(
    private dialog: MatDialog,
    private fileService: FileService) {}

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
  }

  getFiles(): void {
    this.fileService.getFiles(this.directoryPath).subscribe((files) => {
      this.files = files;
      this.dataSource.data = this.files;
    });
  }

  openFileDialog(data: any): void {
    const fileData = JSON.parse(atob(data.contentBase64));
    this.dialog.open(FileDialogComponent, {
      width: '400px',
      data: fileData
    });
  }

  clearFolders() {
    this.directoryPath = '';
    this.files = [];
    this.dataSource.data = this.files;
  }
}
