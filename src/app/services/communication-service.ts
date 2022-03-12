import { Observable } from 'rxjs';
import { ChessBoardMovement } from '../model/movement';

export interface CommunicationService {
  move(movement: ChessBoardMovement): void;
  reset(): void;
  onMove(): Observable<ChessBoardMovement>;
  onReset(): Observable<any>;
  onCheckMate(): Observable<ChessBoardMovement>;
}
