import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChessBoardMovement } from 'src/app/model/movement';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, AfterViewChecked, OnDestroy {
  private readonly subscriptions = new Subscription();
  constructor(private frameCommunication: FrameCommunicationService) {}

  ngOnInit(): void {
    const checkSubs = this.frameCommunication
      .onCheckMate()
      .subscribe((movement) => {
        this.onCheckMate(movement);
      });

    this.subscriptions.add(checkSubs);
  }

  ngAfterViewChecked(): void {
    this.frameCommunication.restorePrevious();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  reset(): void {
    this.frameCommunication.reset();
  }

  private onCheckMate(movement: ChessBoardMovement) {
    alert(`The ${movement.color} pieces have won the match!`);
    this.reset();
  }
}
