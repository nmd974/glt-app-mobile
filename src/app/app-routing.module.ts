import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'my-tour',
    pathMatch: 'full'
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule) },
  {
    path: 'anomaly',
    loadChildren: () => import('./anomaly/anomaly.module').then( m => m.AnomalyPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'my-tour',
    loadChildren: () => import('./my-tour/my-tour.module').then( m => m.MyTourPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
