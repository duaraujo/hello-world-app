import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ROOT_PATH } from 'src/app/constants/app.constants';
import { GetJsonFilesService } from '../services/get-json-files.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { InfoDetailDialogComponent } from '../info-detail-dialog/info-detail-dialog.component';

@Component({
  selector: 'app-list-directory',
  templateUrl: './list-directory.component.html',
  styleUrls: ['./list-directory.component.css'],
})
export class ListDirectoryComponent implements OnInit {
  directoryPath: string = ROOT_PATH;
  folderName!: string;
  form: FormGroup;

  dataSource: any[] = [];
  displayedColumns: string[] = ['image', 'extraImages', 'details'];
  selection = new SelectionModel<string>(false, []);

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private getJsonFiles: GetJsonFilesService,
    private zone: NgZone,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      startDate: [''],
      endDate: [''],
      analyst: [''],
    });
  }

  ngOnInit(): void {
    this.folderName = this.route.snapshot.paramMap.get('folderName') || '';
  }

  getFiles(): void {
    const analystName = this.form.get('analyst')?.value;
    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;

    const path = `${this.directoryPath}/${this.folderName}`;
    this.getJsonFiles.getFiles(path, analystName, startDate, endDate).subscribe((data: any[]) => {
      this.zone.run(() => {
        this.dataSource = data.map((item) => ({
          fullData: item,
          image: item.sample.fileName,
          extraImages: item.sample.extraFileNamesBase64 || [],
          details: {
            fileName: item.sample.title || 'N/A',
            datetime: item.sample.datetime,
            analystName: item.sample.analystName,
            blankFileName: item.sample.blankFileName || 'N/A',
          },
        }));
      });
    });
  }

  onRowClicked(row: any) {
    this.selection.toggle(row);
    const datetime = row.fullData.sample.datetime;
    const regex = /^(\d{4}\.\d{2}\.\d{2})/;
    const folderNameDate = datetime.match(regex)[1];
    const folderNameDateFormatada = folderNameDate.replace(/\./g, "-");
    const path = `${this.directoryPath}/${this.folderName}/${folderNameDateFormatada}`;
    const dialogRef = this.dialog.open(InfoDetailDialogComponent, {
      panelClass: 'custom-dialog-container',
      width: '600px',
      data: {images: row.fullData, directoryPath: path} 
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog was closed');
      this.getFiles();
    });
  }

  onBack(): void {
    this.zone.run(() => {
      this.router.navigate(['/inventory']);
    });
  }
}
