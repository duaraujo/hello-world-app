import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioRoutingModule } from './inventario-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { InventarioListComponent } from './inventario-list/inventario-list.component';
import { GetFoldersService } from './services/get-folders.service';

@NgModule({
    imports: [
        CommonModule,
        InventarioRoutingModule,
        SharedModule
    ],
    declarations: [
        InventarioListComponent,
    ],
    providers: [GetFoldersService]
})
export class InventarioModule { }
