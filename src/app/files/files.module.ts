import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditFileRoutingModule } from './files-routing.module';

@NgModule({
    imports: [
        CommonModule,
        EditFileRoutingModule,
        SharedModule
    ],
    declarations: [
    ],
    providers: []
})
export class EditFileModule { }
