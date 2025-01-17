import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ROOT_PATH } from '../../constants/app.constants';
import { NewGetFoldersService } from '../services/new-get-folders.service';
import { GetInferenceTrainingService } from '../services/get-inference-training.service';
import { EnssayCollectionsDialogComponent } from '../enssay-collections-dialog/enssay-collections-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { UpdateDialogComponent } from '../update-dialog/update-dialog.component';
import { FileService } from 'src/app/files/services/file.service';

@Component({
  selector: 'app-enssay-collections',
  templateUrl: './enssay-collections.component.html',
  styleUrls: ['./enssay-collections.component.css'],
})
export class EnssayCollectionsComponent implements OnInit {
  directoryPath: string = ROOT_PATH + '2/';
  displayedColumns: string[] = ['folder', 'actions'];
  selection = new SelectionModel<string>(false, []);
  filterControl = new FormControl();
  filteredDataSource!: Observable<string[]>;
  dataSource = new MatTableDataSource<string>([]);
  fullPath = '';
  elementSelected = null;
  inferenceSelected = false;

  analystName = '';
  datatime = '';

  dataResultGetImages = [];
  dataSourceImages: any[] = [];
  selectionImages = new SelectionModel<string>(false, []);
  displayedColumnsImages: string[] = ['image', 'extraImages', 'infos'];

  dataSourceAnalitos: any[] = [];
  displayedColumnsAnalitos: string[] = ['nameFolder', 'actions'];

  files: any[] = [];
  directoryPathUpdateFile: string = 'datasets/arquivos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private getFoldersService: NewGetFoldersService,
    private getInferenceTrainingService: GetInferenceTrainingService,
    public dialog: MatDialog,
    private updateDialog: MatDialog,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: string, filter: string) => {
      return data.toLowerCase().includes(filter);
    };

    this.filterControl.valueChanges
      .pipe(
        startWith(''),
        map((value) => value.trim().toLowerCase())
      )
      .subscribe((filterValue) => {
        this.dataSource.filter = filterValue;
      });
  }

  getInferenceTraining(element: any, inference: boolean) {
    this.elementSelected = element;
    this.inferenceSelected = inference;

    let fullPath = this.fullPath +'/'+ element;
    this.getInferenceTrainingService
      .getImages(fullPath, inference)
      .subscribe((data: any) => {
        this.dataResultGetImages = data.images;
        this.analystName = data.analystName;
        this.datatime = data.datetime;

        // Agrupar imagens principais e extras
        const groupedData = data.images.reduce((acc: any, item: any) => {
          // Identificar o nome base antes de '-extra' ou '.jpg'
          const baseName = item.name.includes('-extra-')
            ? item.name.split('-extra-')[0]
            : item.name.split('.jpg')[0];

          // Verificar se já existe o item no agrupamento
          if (!acc[baseName]) {
            // Se não existe, criar a estrutura para a imagem principal
            acc[baseName] = {
              image: null, // Inicialmente sem imagem principal
              name: '', // Inicialmente sem nome
              extraImages: [], // Array para as imagens extras
            };
          }

          // Se for a imagem principal (sem '-extra-'), salvar a imagem e o nome
          if (!item.name.includes('-extra-')) {
            acc[baseName].image = item.base64;
            acc[baseName].name = item.name;
          }

          // Se for uma imagem extra, adicionar ao array de extraImages
          if (item.name.includes('-extra-')) {
            acc[baseName].extraImages.push(item.base64);
          }

          return acc;
        }, {});

        // Converter o objeto agrupado em array para dataSourceImages
        this.dataSourceImages = Object.values(groupedData);
        //console.log(this.dataSourceImages); // Log para ver o array final e verificar se mostra a imagem principal e as extras
      });
  }

  getFolders(): void {
    if (this.directoryPath.trim()) {
      this.getFoldersService
        .getFolders(this.directoryPath)
        .subscribe((data: string[]) => {
          this.dataSource.data = data;
          this.dataSource.filter = '';
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
    } else {
      console.warn('Insira um caminho de diretório válido');
    }
  }

  onRowClicked(row: any) {
    this.selectionImages.toggle(row);
    const dialogRef = this.dialog.open(EnssayCollectionsDialogComponent, {
      panelClass: 'custom-dialog-container',
      width: '600px',
      data: { images: this.dataResultGetImages, directoryPath: this.fullPath },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog was closed');
      this.getInferenceTraining(this.elementSelected, this.inferenceSelected);
    });
  }

  clearFolders() {
    this.directoryPath = '';
    this.dataSource.data = [];
    this.dataSource.filter = '';
    this.selection.clear();
  }

  download(path: string) {
    let fp = this.directoryPath + path;
    this.getFoldersService.download(fp).subscribe(
      (file: Blob) => {
        saveAs(file, 'arquivo.zip');
      },
      (error) => {
        console.error('Erro ao baixar o arquivo:', error);
      }
    );
  }
  

  download2(path: string) {
    
    let fp = this.fullPath +'/'+ path;
    this.getFoldersService.download(fp).subscribe(
      (file: Blob) => {
        saveAs(file, 'arquivo.zip');
      },
      (error) => {
        console.error('Erro ao baixar o arquivo:', error);
      }
    );
  }

  open(path: string) {
    if (this.directoryPath.trim()) {
      this.fullPath = `${this.directoryPath}${path}`;
      this.getFoldersService
        .getFolders(this.fullPath)
        .subscribe((data: any[]) => {
          this.dataSourceAnalitos = data;
        });
    } else {
      console.warn('Insira um caminho de diretório válido');
    }
  }

  update(path: string) {
    let fp = this.directoryPath + path;

    this.fileService.getFiles(fp).subscribe((files) => {
      this.files = files;
      let data = this.files[0];
      const fileData = JSON.parse(atob(data.contentBase64));
      const dialogRefUpdate = this.updateDialog.open(UpdateDialogComponent, {
        width: '400px',
        data: { data: fileData, urlPath: fp },
      });
      dialogRefUpdate.afterClosed().subscribe(() => {
        this.getFolders();
      });
    });
  }
}
