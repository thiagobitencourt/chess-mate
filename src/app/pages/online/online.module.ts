import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineComponent } from './online.component';
import { Route, RouterModule } from '@angular/router';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { ComponentsModule } from 'src/app/components/components.module';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    ButtonModule,
    InputTextModule,
    DividerModule,
    NgxChessBoardModule,
    RouterModule.forChild(routes),
    ConfirmDialogModule,
  ],
})
export class OnlineModule {}
