import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditFileRoutingModule } from './files-routing.module';
import { FileDialogComponent } from './file-dialog/file-dialog.component';
import { FilesComponent } from './files-list/files.component';

@NgModule({
    imports: [
        CommonModule,
        EditFileRoutingModule,
        SharedModule
    ],
    declarations: [
        FilesComponent,
        FileDialogComponent,
    ],
    providers: []
})
export class EditFileModule { }
