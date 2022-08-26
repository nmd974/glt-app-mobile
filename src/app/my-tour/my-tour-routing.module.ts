import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyTourPage } from './my-tour.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: MyTourPage,
    children: [
      {
        path: 'step-list',
        children: [
          {
            path: '',
            loadChildren: () => import('../step-list/step-list.module').then( m => m.StepListPageModule)
          },
          {
            path: ':stepId',
            loadChildren: () => import('../step-detail/step-detail.module').then( m => m.StepDetailPageModule)
          },
        ]

      },
      {
        path: 'anomaly',
        loadChildren: () => import('../anomaly/anomaly.module').then( m => m.AnomalyPageModule)
      },
      {
        path: 'my-profile',
        loadChildren: () => import('../profile/profile.module').then( m => m.ProfilePageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/my-tour/tabs/step-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyTourPageRoutingModule {}
