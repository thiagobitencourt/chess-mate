import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ChessMatch } from './chess-match';

@Injectable({
  providedIn: 'root',
})
export class RealTimeCommunicationService {
  constructor(private database: AngularFireDatabase) {}

  createMatch(): ChessMatch {
    return new ChessMatch(this.database);
  }

  joinMatch(matchCode: string): ChessMatch {
    return new ChessMatch(this.database, matchCode);
  }
}
