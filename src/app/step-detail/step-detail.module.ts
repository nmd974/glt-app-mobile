import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StepDetailPageRoutingModule } from './step-detail-routing.module';

import { StepDetailPage } from './step-detail.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    StepDetailPageRoutingModule
  ],
  declarations: [StepDetailPage]
})
export class StepDetailPageModule {}
