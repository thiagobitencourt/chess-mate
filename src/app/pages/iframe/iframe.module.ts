import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IframeComponent } from './iframe.component';
import { Route, RouterModule } from '@angular/router';

const routes: Route[] = [
  {
    path: '',
    component: IframeComponent,
  },
];

@NgModule({
  declarations: [IframeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class IframeModule {}
