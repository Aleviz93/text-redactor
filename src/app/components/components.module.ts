import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckBoxComponent } from './check-box/check-box.component';
import { ModalComponent } from './modal/modal.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { MatMenuModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
    InlineSVGModule.forRoot(),
  ],
  declarations: [
    CheckBoxComponent,
    ModalComponent
  ],
  exports: [
    CheckBoxComponent,
    ModalComponent
  ]
})
export class AppComponentsModule {}
