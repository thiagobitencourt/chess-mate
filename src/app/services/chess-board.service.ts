import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChessBoardMovement } from '../model/movement';
import { CommunicationService } from './communication-service';

@Injectable({
  providedIn: 'root',
})
export class ChessBoardService {
  private communication!: CommunicationService;
  constructor() {}

  setCommunication(communication: CommunicationService): void {
    this.communication = communication;
  }

  move(movement: ChessBoardMovement): void {
    this.communication.move(movement);
  }

  opponentMove(): Observable<ChessBoardMovement> {
    return this.communication.onMove();
  }

  resetBoard(): Observable<void> {
    return this.communication.onReset();
  }
}
