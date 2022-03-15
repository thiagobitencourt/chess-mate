import { ChessBoardMovement } from './movement';

export interface OnlineMessage {
  matchCode?: string;
  joined?: boolean;
  left?: boolean;
  move?: ChessBoardMovement;
}
