import { Injectable } from '@angular/core';
import { Confirmation, ConfirmationService } from 'primeng/api';
import { Observable, of, Subscriber } from 'rxjs';
import { ChessPieceColor } from '../model/movement';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly mainPage = 'main-page';
  //  private readonly onlinePage = 'online-page';

  constructor(private confirmationService: ConfirmationService) {}

  restorePreviousMatch(): Observable<boolean> {
    return new Observable<boolean>((subject) => {
      this.confirmationService.confirm({
        key: 'main-page',
        header: 'Restore previous match?',
        acceptLabel: 'Restore',
        rejectLabel: 'New game',
        message:
          "You haven't finished the last match yet. Would you like to restore it?",
        accept: () => this.respond(subject, true),
        reject: () => this.respond(subject, false),
      });
    });
  }

  notifyCheckmate(pieceColor: ChessPieceColor): Observable<boolean> {
    return new Observable<boolean>((subject) => {
      this.confirmationService.confirm({
        key: 'main-page',
        header: 'Check mate',
        acceptLabel: 'New game',
        rejectVisible: false,
        message: `The ${pieceColor} pieces have won the match!`,
        accept: () => this.respond(subject, true),
        reject: () => this.respond(subject, false),
      });
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
