import { Component, OnInit, ViewChild } from '@angular/core';
import { GetFoldersService } from '../inventario/services/get-folders.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ROOT_PATH } from '../constants/app.constants';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit {
  directoryPath: string = ROOT_PATH;
  displayedColumns: string[] = ['folder'];
  selection = new SelectionModel<string>(false, []);
  filterControl = new FormControl();
  filteredDataSource!: Observable<string[]>;
  dataSource = new MatTableDataSource<string>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private getFoldersService: GetFoldersService,
    private router: Router
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

  onRowClicked(row: string) {
    this.selection.toggle(row);
    this.router.navigate(['inventory/list-directory', row]);
  }

  clearFolders() {
    this.directoryPath = '';
    this.dataSource.data = [];
    this.dataSource.filter = '';
    this.selection.clear();
  }
}
