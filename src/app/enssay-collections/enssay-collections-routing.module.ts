import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/layout/layout.component';
import { EnssayCollectionsComponent } from './enssay-collections/enssay-collections.component';
import { AnalitosComponent } from './analitos/analitos.component';
import { DetalhesComponent } from './detalhes/detalhes.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: EnssayCollectionsComponent },
      { path: 'analitos/:folder/:name', component: AnalitosComponent },
      { path: 'detalhes/:folder/:useTraining', component: DetalhesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class EnssayCollectionsRoutingModule {}
