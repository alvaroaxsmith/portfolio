import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'


@NgModule({
  exports: [
    MatDialogModule,
    MatExpansionModule,
    FontAwesomeModule
  ]
})
export class MaterialModule {

}