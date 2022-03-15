import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChessBoardMovement } from 'src/app/model/movement';
import { ChessMatch } from 'src/app/services/chess-match';
import { RealTimeCommunicationService } from 'src/app/services/real-time-communication.service';

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.scss'],
})
export class OnlineComponent implements OnInit, OnDestroy {
  match!: ChessMatch;

  moves = 0;
  constructor(private rtCommunication: RealTimeCommunicationService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // this.subscriptions.unsubscribe();
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
    this.match.leave();
  }

  move(): void {
    this.match.move({
      move: (++this.moves).toString(),
      color: 'white',
    } as ChessBoardMovement);
  }

  private setUpListeners(): void {
    if (this.match.owner) {
      this.match.onJoined().subscribe(() => {
        alert('a new player has joined the match!');
      });
    }

    this.match.onMove().subscribe((move) => {
      if (move) {
        console.log('opponents move: ', move);
        this.moves = parseInt(move.move);
      }
    });

    this.match.onLeft().subscribe(() => {
      alert('It seems that yout opponent has left the match');
    });
  }
}
