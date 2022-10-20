import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderAnomalyPageRoutingModule } from './order-anomaly-routing.module';

import { OrderAnomalyPage } from './order-anomaly.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OrderAnomalyPageRoutingModule
  ],
  declarations: [OrderAnomalyPage]
})
export class OrderAnomalyPageModule {}
