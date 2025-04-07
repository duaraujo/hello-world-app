import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioRoutingModule } from './inventario-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GetFoldersService } from './services/get-folders.service';

@NgModule({
    imports: [
        CommonModule,
        InventarioRoutingModule,
        SharedModule
    ],
    declarations: [
    ],
    providers: [GetFoldersService]
})
export class InventarioModule { }
