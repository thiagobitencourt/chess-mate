import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineComponent } from './online.component';
import { Route, RouterModule } from '@angular/router';
import { NgxChessBoardModule } from 'ngx-chess-board';

const routes: Route[] = [
  {
    path: '',
    component: OnlineComponent,
  },
];

@NgModule({
  declarations: [OnlineComponent],
  imports: [CommonModule, NgxChessBoardModule, RouterModule.forChild(routes)],
})
export class OnlineModule {}
