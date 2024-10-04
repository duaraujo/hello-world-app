import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryComponent } from './inventory.component';
import { InventoryRoutingModule } from './inventory-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ListDirectoryComponent } from './list-directory/list-directory.component';
import { InfoDetailDialogComponent } from './info-detail-dialog/info-detail-dialog.component';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';



@NgModule({
  declarations: [
    InventoryComponent,
    ListDirectoryComponent,
    InfoDetailDialogComponent,
    ConfirmDeleteDialogComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule
  ]
})
export class InventoryModule { }
