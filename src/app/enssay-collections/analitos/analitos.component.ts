import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewGetFoldersService } from '../services/new-get-folders.service';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-analitos',
  templateUrl: './analitos.component.html',
  styleUrls: ['./analitos.component.css'],
})
export class AnalitosComponent implements OnInit, AfterViewInit {
  folder = '';
  name = '';
  dataSourceAnalitos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getFoldersService: NewGetFoldersService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.folder = this.route.snapshot.paramMap.get('folder')!;
      this.name = this.route.snapshot.paramMap.get('name')!;
      this.getFoldersService.getCapturesTaken(this.folder).subscribe((data) => {
        this.dataSourceAnalitos = data;
      });
    });
  }

  getInferenceTraining(path: string, useTraining: boolean) {
    const fullPath = `${this.folder}/${path}`;
    this.router.navigate(['/enssay/detalhes', fullPath, useTraining]);
  }

  download2(path: string) {
    const filePath = `${this.folder}/${path}`;
    this.getFoldersService.download(filePath).subscribe(
      (file: Blob) => {
        saveAs(file, 'arquivo.zip');
      },
      (error) => {
        console.error('Erro ao baixar o arquivo:', error);
      }
    );
  }

  voltar() {
    this.router.navigate(['/enssay']);
  }
}
