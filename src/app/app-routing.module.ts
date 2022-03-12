import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'mainpage',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'iframepage',
    loadChildren: () =>
      import('./pages/iframe/iframe.module').then((m) => m.IframeModule),
  },
  { path: '**', redirectTo: 'mainpage' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
