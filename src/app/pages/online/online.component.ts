import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';
import { Subscription } from 'rxjs';
import { ChessBoardMovement } from 'src/app/model/movement';
import { ChessMatch } from 'src/app/services/chess-match';
import { NotificationService } from 'src/app/services/notification.service';
import { RealTimeCommunicationService } from 'src/app/services/real-time-communication.service';

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.scss'],
})
export class OnlineComponent implements OnDestroy {
  private readonly subscriptions = new Subscription();
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;

  lightDisabled!: boolean;
  darkDisabled!: boolean;
  match!: ChessMatch | null;
  private justMuvedByOpponent!: boolean;
  private started = false;

  constructor(
    private rtCommunication: RealTimeCommunicationService,
    private notificationService: NotificationService
  ) {
    this.setInitialValues();
  }

  ngOnDestroy(): void {
    this.finishMatch();
  }

  newMatch(): void {
    this.match = this.rtCommunication.createMatch();
    this.setUpListeners();
  }

  joinMatch(matchCode: string): void {
    this.match = this.rtCommunication.joinMatch(matchCode);
    this.setUpListeners();
  }

  leaveMatch(): void {
    this.match?.leave();
    this.finishMatch();
  }

  move(movement: any): void {
    if (this.justMuvedByOpponent) {
      this.justMuvedByOpponent = false;
      return;
    }

    this.match?.move(movement as ChessBoardMovement);
    this.handleCheckMate(movement);
  }

  copyCode() {
    navigator.clipboard.writeText(this.match?.code as string);
  }

  private setUpListeners(): void {
    if (this.match?.owner) {
      this.match.onJoined().subscribe(() => this.handleJoined());
    }

    this.match?.onMove().subscribe((movement) => this.handleMove(movement));
    this.match?.onLeft().subscribe(() => this.handleLeft());
  }

  private handleMove(movement: ChessBoardMovement): void {
    if (movement) {
      this.justMuvedByOpponent = true;
      if (!this.started) {
        this.started = true;
        this.darkDisabled = false;
      }

      this.handleCheckMate(movement);
      this.board.move(movement.move);
    }
  }

  private handleCheckMate(movement: ChessBoardMovement): void {
    if (movement.mate) {
      this.notificationService
        .notifyCheckmateOnline(movement.color)
        .subscribe((newGame: boolean) => {
          if (newGame) {
            this.finishMatch();
          }
        });
    }
  }

  private handleJoined(): void {
    this.notificationService.notifyPlayerJoined().subscribe(() => {
      this.started = true;
      this.lightDisabled = false;
    });
  }

  private handleLeft(): void {
    this.notificationService
      .notifyPlayerLeft()
      .subscribe(() => this.finishMatch());
  }

  private finishMatch(): void {
    this.subscriptions.unsubscribe();
    this.setInitialValues();
  }

  private setInitialValues(): void {
    this.justMuvedByOpponent = false;
    this.lightDisabled = true;
    this.darkDisabled = true;
    this.match = null;
  }
}
