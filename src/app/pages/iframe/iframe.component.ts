import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';
import { Subscription } from 'rxjs';
import { ChessBoardMovement, ChessPieceColor } from 'src/app/model/movement';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.scss'],
})
export class IframeComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;

  justMuvedByOpponent = false;
  started = false;
  lightDisabled = false;
  darkDisabled = false;

  constructor(private frameCommunication: FrameCommunicationService) {}

  ngOnInit(): void {
    this.addListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  move(movement: any): void {
    if (this.justMuvedByOpponent) {
      this.justMuvedByOpponent = false;
      return;
    }

    this.disableBlackColor(movement.color === ChessPieceColor.WHITE);
    this.frameCommunication.move(movement as ChessBoardMovement);
  }

  private disableBlackColor(disableBlackColor: boolean): void {
    if (!this.started) {
      this.darkDisabled = disableBlackColor;
      this.lightDisabled = !disableBlackColor;
      this.started = true;
    }
  }

  private addListeners(): void {
    const moveSubs = this.frameCommunication
      .onMove()
      .subscribe((movement) => this.handleOpponentMove(movement));

    const resetSubs = this.frameCommunication
      .onReset()
      .subscribe(() => this.handleResetBoard());

    const resumeSubs = this.frameCommunication.onResume().subscribe((fen) => {
      this.board.setFEN(fen);
    });

    this.subscriptions.add(moveSubs).add(resetSubs).add(resumeSubs);
  }

  private handleOpponentMove(movement: any): void {
    this.justMuvedByOpponent = true;
    this.disableBlackColor(movement.color === ChessPieceColor.BLACK);
    this.board.move(movement.move);
  }

  private handleResetBoard(): void {
    this.board.reset();
    this.started = false;
    this.darkDisabled = false;
    this.lightDisabled = false;
  }
}
