import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { NewGetFoldersService } from './services/new-get-folders.service';
import { EnssayCollectionsRoutingModule } from './enssay-collections-routing.module';
import { EnssayCollectionsComponent } from './enssay-collections/enssay-collections.component';
import { EnssayCollectionsListComponent } from './enssay-collections-list/enssay-collections-list.component';
import { GetInferenceTrainingService } from './services/get-inference-training.service';
import { EnssayCollectionsDialogComponent } from './enssay-collections-dialog/enssay-collections-dialog.component';
import { DeleteImageService } from './services/delete-image.service';
import { ConfirmMainDialogComponent } from './confirm-main-dialog/confirm-main-dialog.component';
import { UpdateDialogComponent } from './update-dialog/update-dialog.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    EnssayCollectionsComponent,
    EnssayCollectionsListComponent,
    EnssayCollectionsDialogComponent,
    ConfirmMainDialogComponent,
    UpdateDialogComponent
  ],
  imports: [
    CommonModule,
    EnssayCollectionsRoutingModule,
    SharedModule,
    TranslateModule
  ],
  providers:[NewGetFoldersService, GetInferenceTrainingService, DeleteImageService]
})
export class EnssayCollectionsModule { }
