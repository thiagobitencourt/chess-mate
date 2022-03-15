import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OnlyIframeGuard } from './guard/only-iframe.guard';

const routes: Routes = [
  {
    path: 'mainpage',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'iframepage',
    canActivate: [OnlyIframeGuard],
    canLoad: [OnlyIframeGuard],
    loadChildren: () =>
      import('./pages/iframe/iframe.module').then((m) => m.IframeModule),
  },
  {
    path: 'onlinepage',
    loadChildren: () =>
      import('./pages/online/online.module').then((m) => m.OnlineModule),
  },
  { path: '**', redirectTo: 'mainpage' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [OnlyIframeGuard],
  exports: [RouterModule],
})
export class AppRoutingModule {}
