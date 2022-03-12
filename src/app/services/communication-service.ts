import { Observable } from 'rxjs';
import { ChessBoardMovement } from '../model/movement';

export interface CommunicationService {
  move(movement: ChessBoardMovement): void;
  onMove(): Observable<ChessBoardMovement>;
  onReset(): Observable<any>;
}
