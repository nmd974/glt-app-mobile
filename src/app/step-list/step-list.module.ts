import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StepListPageRoutingModule } from './step-list-routing.module';

import { StepListPage } from './step-list.page';
import { TimeLocalPipe } from '../shared/custom-pipes.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StepListPageRoutingModule,

  ],
  declarations: [StepListPage, TimeLocalPipe]
})
export class StepListPageModule {}
