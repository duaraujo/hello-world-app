import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { GetInferenceTrainingService } from '../services/get-inference-training.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-enssay-collections-list',
  templateUrl: './enssay-collections-list.component.html',
  styleUrls: ['./enssay-collections-list.component.css'],
})
export class EnssayCollectionsListComponent implements OnInit {
  folders: string[] = [];
  folderName!: string;

  directoryPath: string =
    'downloads/ChemicalAnalysis2/9b438b9b-e627-443e-9d20-6b358b965e79/AlkalinityKey-2024-06-28/Analytical-Parameter-Key/Capture-Technique-Key-1';

  constructor(
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private titleService: Title,
    public dialog: MatDialog,
    private getFoldersService: GetInferenceTrainingService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Inventario');
    this.notificationService.openSnackBar('Inventario carregado');
    this.folderName = this.route.snapshot.paramMap.get('folderName') || '';
    console.log(this.folderName)
    this.getFolders();
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

  // openDialog(folderName: string): void {
  //   const selectedFolder = `${this.directoryPath}/${folderName}`;
  //   this.getFoldersService.getImages(selectedFolder).subscribe((images) => {
  //     this.dialog.open(InventarioDialogComponent, {
  //       data: { images, directoryPath: selectedFolder },
  //       width: '500px',
  //     });
  //   });
  // }
}
