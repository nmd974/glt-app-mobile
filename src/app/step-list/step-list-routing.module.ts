import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StepListPage } from './step-list.page';

const routes: Routes = [
  {
    path: '',
    component: StepListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StepListPageRoutingModule {}
