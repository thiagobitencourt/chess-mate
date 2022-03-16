import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';
import { Subscription } from 'rxjs';
import { ChessBoardMovement } from 'src/app/model/movement';
import { ChessMatch } from 'src/app/services/chess-match';
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

  constructor(private rtCommunication: RealTimeCommunicationService) {
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

  private setUpListeners(): void {
    if (this.match?.owner) {
      this.match.onJoined().subscribe(() => {
        alert('A player has joined the match!');
        this.lightDisabled = false;
      });
    }

    this.match?.onMove().subscribe((movement) => {
      if (movement) {
        this.justMuvedByOpponent = true;
        this.darkDisabled = false;

        this.handleCheckMate(movement);
        this.board.move(movement.move);
      }
    });

    this.match?.onLeft().subscribe(() => {
      alert('Your opponent has left the match!');
      this.finishMatch();
    });
  }

  private handleCheckMate(movement: ChessBoardMovement): void {
    if (movement.mate) {
      setTimeout(() => {
        alert(`The ${movement.color} pieces won this match!`);
        this.finishMatch();
      }, 500);
    }
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
