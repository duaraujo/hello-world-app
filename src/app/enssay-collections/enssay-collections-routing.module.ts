import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/layout/layout.component';
import { EnssayCollectionsListComponent } from './enssay-collections-list/enssay-collections-list.component';
import { EnssayCollectionsComponent } from './enssay-collections/enssay-collections.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: EnssayCollectionsComponent },
      { path: 'new-list-directory/:folderName', component: EnssayCollectionsListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class EnssayCollectionsRoutingModule { }
