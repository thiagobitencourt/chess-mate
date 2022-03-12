import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { NgxChessBoardModule } from 'ngx-chess-board';

import { IframeComponent } from './iframe.component';

const routes: Route[] = [
  {
    path: '',
    component: IframeComponent,
  },
];

@NgModule({
  declarations: [IframeComponent],
  imports: [CommonModule, NgxChessBoardModule, RouterModule.forChild(routes)],
})
export class IframeModule {}
