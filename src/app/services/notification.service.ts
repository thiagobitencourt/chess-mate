import { Injectable } from '@angular/core';
import { Confirmation, ConfirmationService } from 'primeng/api';
import { Observable, of, Subscriber } from 'rxjs';
import { ChessPieceColor } from '../model/movement';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly mainPage = 'main-page';
  private readonly onlinePage = 'online-page';

  constructor(private confirmationService: ConfirmationService) {}

  restorePreviousMatch(): Observable<boolean> {
    return this.confirm(this.mainPage, {
      header: 'Restore previous match?',
      acceptLabel: 'Restore',
      rejectLabel: 'New game',
      message: 'Would you like to restore the previous match?',
    });
  }

  notifyCheckmate(pieceColor: ChessPieceColor): Observable<boolean> {
    return this.confirm(this.mainPage, {
      header: 'Check mate',
      acceptLabel: 'New game',
      rejectVisible: false,
      message: `The ${pieceColor} pieces have won the match!`,
    });
  }

  notifyCheckmateOnline(pieceColor: ChessPieceColor): Observable<boolean> {
    return this.confirm(this.onlinePage, {
      header: 'Check mate',
      acceptLabel: 'Close',
      rejectVisible: false,
      message: `The ${pieceColor} pieces have won the match!`,
    });
  }

  notifyPlayerJoined(): Observable<boolean> {
    return this.confirm(this.onlinePage, {
      header: 'Player joined',
      acceptLabel: 'Play',
      rejectVisible: false,
      message: `A player has joined the match. You start with white pieces!`,
    });
  }

  notifyPlayerLeft(): Observable<boolean> {
    return this.confirm(this.onlinePage, {
      header: 'Player left',
      acceptLabel: 'Leave',
      rejectVisible: false,
      message: 'Your opponent has left the match!',
    });
  }

  resetMatch(): Observable<boolean> {
    return this.confirm(this.mainPage, {
      header: 'Reset the current match',
      message: 'Do you really want to reset the current match?',
    });
  }

  private confirm(key: string, config: Confirmation): Observable<boolean> {
    return new Observable<boolean>((subject) => {
      this.confirmationService.confirm({
        ...config,
        key,
        accept: () => this.respond(subject, true),
        reject: () => this.respond(subject, false),
      });
    });
  }

  private respond(subject: Subscriber<any>, answer?: any): void {
    subject.next(answer);
    subject.complete();
  }
}
