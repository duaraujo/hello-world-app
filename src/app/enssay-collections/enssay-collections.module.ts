import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NewGetFoldersService } from './services/new-get-folders.service';
import { EnssayCollectionsRoutingModule } from './enssay-collections-routing.module';
import { EnssayCollectionsComponent } from './enssay-collections/enssay-collections.component';
import { GetInferenceTrainingService } from './services/get-inference-training.service';
import { ConfirmMainDialogComponent } from './confirm-main-dialog/confirm-main-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { AnalitosComponent } from './analitos/analitos.component';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { EditDialogComponent } from './edit-dialog/edit-dialog.component';



@NgModule({
  declarations: [
    EnssayCollectionsComponent,
    ConfirmMainDialogComponent,
    AnalitosComponent,
    DetalhesComponent,
    ImageViewerComponent,
    EditDialogComponent,
  ],
  imports: [
    CommonModule,
    EnssayCollectionsRoutingModule,
    SharedModule,
    TranslateModule
  ],
  providers:[NewGetFoldersService, GetInferenceTrainingService]
})
export class EnssayCollectionsModule { }
