import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineComponent } from './online.component';
import { Route, RouterModule } from '@angular/router';

const routes: Route[] = [
  {
    path: '',
    component: OnlineComponent,
  },
];

@NgModule({
  declarations: [OnlineComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class OnlineModule {}
