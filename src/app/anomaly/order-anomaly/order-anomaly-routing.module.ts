import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderAnomalyPage } from './order-anomaly.page';

const routes: Routes = [
  {
    path: '',
    component: OrderAnomalyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderAnomalyPageRoutingModule {}
