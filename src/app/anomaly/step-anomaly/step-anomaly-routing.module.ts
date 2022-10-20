import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StepAnomalyPage } from './step-anomaly.page';

const routes: Routes = [
  {
    path: '',
    component: StepAnomalyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StepAnomalyPageRoutingModule {}
