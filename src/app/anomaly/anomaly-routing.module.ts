import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnomalyPage } from './anomaly.page';

const routes: Routes = [
  {
    path: '',
    component: AnomalyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnomalyPageRoutingModule {}
