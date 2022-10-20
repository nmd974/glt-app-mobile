import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TourAnomalyPageRoutingModule } from './tour-anomaly-routing.module';

import { TourAnomalyPage } from './tour-anomaly.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TourAnomalyPageRoutingModule
  ],
  declarations: [TourAnomalyPage]
})
export class TourAnomalyPageModule {}
