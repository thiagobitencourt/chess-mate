import { Injectable } from '@angular/core';
import { CanActivate, CanLoad } from '@angular/router';

@Injectable()
export class OnlyIframeGuard implements CanActivate, CanLoad {
  canLoad(): boolean {
    return this.isIframe() || this.notAllowedAlert();
  }

  canActivate(): boolean {
    return this.isIframe() || this.notAllowedAlert();
  }

  private isIframe(): boolean {
    return window.parent !== window.self;
  }

  private notAllowedAlert(): boolean {
    alert('This page can only be opened inside an iframe');
    return false;
  }
}
