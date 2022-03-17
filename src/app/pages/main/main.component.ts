import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  constructor(private frameCommunication: FrameCommunicationService) {}

  ngOnInit(): void {
    this.resetListener();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  reset(force = false): void {
    this.frameCommunication.reset(force);
  }

  private resetListener(): void {
    this.subscriptions.add(
      this.frameCommunication.onReset().subscribe(() => this.reset(true))
    );
  }
}
