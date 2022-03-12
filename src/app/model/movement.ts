export enum ChessPieceColor {
  BLACK = 'black',
  WHITE = 'white',
}

export interface ChessBoardMovement {
  move: string;
  piece: string;
  color: ChessPieceColor;
  check: boolean;
  mate: boolean;
  stalemate: boolean;
  fen: string;
}
