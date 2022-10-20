import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StepAnomalyPageRoutingModule } from './step-anomaly-routing.module';

import { StepAnomalyPage } from './step-anomaly.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StepAnomalyPageRoutingModule
  ],
  declarations: [StepAnomalyPage]
})
export class StepAnomalyPageModule {}
