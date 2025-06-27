import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewGetFoldersService } from '../services/new-get-folders.service';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.css'],
})
export class DetalhesComponent implements OnInit, AfterViewInit {
  folder = '';
  useTraining = false;
  dataList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getFoldersService: NewGetFoldersService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.folder = this.route.snapshot.paramMap.get('folder')!;
      this.useTraining =
        this.route.snapshot.paramMap.get('useTraining') === 'true';

      const path = this.folder;
      this.getFoldersService
        .parseJsons(path, this.useTraining)
        .subscribe((data) => {
          this.dataList = data;
        });
    });
  }

  ngOnInit(): void {}

  getLayoutClass(): string {
  return window.innerWidth >= 1280 ? 'horizontal' : 'vertical';
}

  voltar() {
    this.router.navigate(['/enssay/analitos', this.folder]);
  }
}
