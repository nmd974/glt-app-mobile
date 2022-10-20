import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TourAnomalyPage } from './tour-anomaly.page';

const routes: Routes = [
  {
    path: '',
    component: TourAnomalyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TourAnomalyPageRoutingModule {}
