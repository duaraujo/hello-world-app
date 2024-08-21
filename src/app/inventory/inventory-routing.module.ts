import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/layout/layout.component';
import { InventoryComponent } from './inventory.component';
import { ListDirectoryComponent } from './list-directory/list-directory.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: InventoryComponent },
      { path: 'list-directory/:folderName', component: ListDirectoryComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class InventoryRoutingModule { }
