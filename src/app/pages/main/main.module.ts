import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { Route, RouterModule } from '@angular/router';
import { ComponentsModule } from 'src/app/components/components.module';

const routes: Route[] = [
  {
    path: '',
    component: MainComponent,
  },
];

@NgModule({
  declarations: [MainComponent],
  imports: [CommonModule, ComponentsModule, RouterModule.forChild(routes)],
})
export class MainModule {}
