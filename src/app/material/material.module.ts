import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  exports: [
    MatDialogModule,
    MatExpansionModule
  ]
})
export class MaterialModule {

}