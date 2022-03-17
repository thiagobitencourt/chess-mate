import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { Route, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ComponentsModule } from 'src/app/components/components.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const routes: Route[] = [
  {
    path: '',
    component: MainComponent,
  },
];

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    ButtonModule,
    ComponentsModule,
    RouterModule.forChild(routes),
    ConfirmDialogModule,
  ],
})
export class MainModule {}
