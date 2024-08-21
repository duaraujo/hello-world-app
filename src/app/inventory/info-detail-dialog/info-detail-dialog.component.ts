import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-info-detail-dialog',
  templateUrl: './info-detail-dialog.component.html',
  styleUrls: ['./info-detail-dialog.component.css'],
})
export class InfoDetailDialogComponent implements OnInit {
  currentIndex: number = 0;
  images: string[] = [];
  isTextView: boolean = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    // Adiciona a imagem principal e as imagens extras ao array de imagens
    if (this.data.sample.fileName) {
      this.images.push(this.data.sample.fileName);
    }
    if (
      this.data.sample.extraFileNames &&
      this.data.sample.extraFileNames.length > 0
    ) {
      this.images.push(...this.data.sample.extraFileNames);
    }
  }

  previous(): void {
    if (this.isTextView) return; // Não faz nada se estiver na visualização de texto
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.isTextView = true; // Volta para a tela de texto
    }
  }

  next(): void {
    if (this.isTextView) {
      this.isTextView = false; // Avança para a primeira imagem
    } else if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
  }
}
