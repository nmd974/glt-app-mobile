import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnomalyPageRoutingModule } from './anomaly-routing.module';

import { AnomalyPage } from './anomaly.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnomalyPageRoutingModule
  ],
  declarations: [AnomalyPage]
})
export class AnomalyPageModule {}
