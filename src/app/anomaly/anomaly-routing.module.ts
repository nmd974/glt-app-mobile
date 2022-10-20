import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

import { AnomalyPage } from './anomaly.page';


const routes: Routes = [
  {
    path: '',
    // pathMatch: 'full',
    component: AnomalyPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnomalyPageRoutingModule {}
