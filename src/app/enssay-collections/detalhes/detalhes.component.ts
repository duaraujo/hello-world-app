import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewGetFoldersService } from '../services/new-get-folders.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.css'],
})
export class DetalhesComponent implements OnInit, AfterViewInit {
  folder = '';
  useTraining = false;
  dataList: any[] = [];
  EXTRAS_PER_PAGE = 4;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getFoldersService: NewGetFoldersService,
    private dialog: MatDialog
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
          this.dataList = data.map((item: any) => ({
            ...item,
            datetime: item.datetime
              ? this.parseCustomDate(item.datetime)
              : null,
            extraImagesPage: 0,
          }));
        });
    });
  }

  ngOnInit(): void {}

  getLayoutClass(): string {
    return window.innerWidth >= 1280 ? 'horizontal' : 'vertical';
  }

  voltar() {
    this.router.navigate(['/enssay']);
  }

  openImage(base64: string, alt: string) {
    this.dialog.open(ImageViewerComponent, {
      data: {
        base64: 'data:image/jpeg;base64,' + base64,
        alt: alt,
      },
      panelClass: 'custom-dialog',
    });
  }

  getExtraImagesToShow(item: any): any[] {
    const start = item.extraImagesPage * this.EXTRAS_PER_PAGE;
    return item.extraFileNames.slice(start, start + this.EXTRAS_PER_PAGE);
  }

  hasPrevExtras(item: any): boolean {
    return item.extraImagesPage > 0;
  }

  hasNextExtras(item: any): boolean {
    const start = (item.extraImagesPage + 1) * this.EXTRAS_PER_PAGE;
    return start < item.extraFileNames.length;
  }

  goToPrevExtras(item: any) {
    if (this.hasPrevExtras(item)) {
      item.extraImagesPage--;
    }
  }

  goToNextExtras(item: any) {
    if (this.hasNextExtras(item)) {
      item.extraImagesPage++;
    }
  }

  parseCustomDate(dt: string): Date {
    let fixed = dt.replace('.', '-').replace('.', '-').replace(' ', 'T');
    fixed = fixed.replace(' -', '-');
    return new Date(fixed);
  }
}
