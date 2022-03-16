import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineComponent } from './online.component';
import { Route, RouterModule } from '@angular/router';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { ComponentsModule } from 'src/app/components/components.module';

const routes: Route[] = [
  {
    path: '',
    component: OnlineComponent,
  },
];

@NgModule({
  declarations: [OnlineComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    NgxChessBoardModule,
    RouterModule.forChild(routes),
  ],
})
export class OnlineModule {}
