import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyTourPageRoutingModule } from './my-tour-routing.module';

import { MyTourPage } from './my-tour.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyTourPageRoutingModule
  ],
  declarations: [MyTourPage]
})
export class MyTourPageModule {}
