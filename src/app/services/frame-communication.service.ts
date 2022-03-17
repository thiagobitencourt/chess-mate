import { Injectable, Inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Message } from '../model/message';
import { MessageType } from '../model/message-type';
import { ChessBoardMovement, ChessPieceColor } from '../model/movement';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class FrameCommunicationService {
  private readonly onMoveSubject = new Subject<ChessBoardMovement>();
  private readonly onResetSubject = new Subject<void>();
  private readonly onResumeSubject = new Subject<string>();

  private readonly CHESS_MATE_STATUS = 'CHESS_MATE_STATUS';
  private readonly frames: any = {};
  private frameId!: string;
  private framesRegistered = 0;

  constructor(
    @Inject('Window') private window: Window,
    private notificationService: NotificationService
  ) {
    this.init();
  }

  init(): void {
    this.listenToMessages();
    this.initFrame();
  }

  move(movement: ChessBoardMovement): void {
    this.sendMessage({ type: MessageType.MOVE, payload: movement });
  }

  reset(): void {
    this.notificationService.resetMatch().subscribe((resetMatch: boolean) => {
      if (resetMatch) {
        this.handleReset();
      }
    });
  }

  onMove(): Observable<any> {
    return this.onMoveSubject.asObservable();
  }

  onReset(): Observable<any> {
    return this.onResetSubject.asObservable();
  }

  onResume(): Observable<string> {
    return this.onResumeSubject.asObservable();
  }

  isIframe(): boolean {
    return this.window.parent !== this.window.self;
  }

  private initFrame(): void {
    this.frameId = this.frameId || Date.now().toString();
    if (this.isIframe()) {
      this.sendMessage({ type: MessageType.INIT });
    }
  }

  private sendMessage(
    message: Partial<Message>,
    target = this.window.parent
  ): void {
    message.frameId = message.frameId || this.frameId;
    target.postMessage(message, this.window.location.origin);
  }

  private listenToMessages(): void {
    this.window.addEventListener('message', (event) => {
      const message = event.data as Message;
      if (!this.isMessageValid(message)) {
        return;
      }

      return this.isIframe()
        ? this.iframeHandleMessage(message)
        : this.mainPageHandleMessage(message, event);
    });
  }

  private iframeHandleMessage(message: Message): void {
    switch (message.type) {
      case MessageType.MOVE: {
        this.onMoveSubject.next(message.payload as ChessBoardMovement);
        break;
      }
      case MessageType.RESET: {
        this.onResetSubject.next();
        break;
      }
      case MessageType.RESUME: {
        this.onResumeSubject.next(message.payload as string);
        break;
      }
    }
  }

  private mainPageHandleMessage(message: Message, event: any): void {
    if (message.type === MessageType.INIT) {
      return this.registerIframe(event);
    }

    if (message.type === MessageType.MOVE) {
      const movement = message.payload as ChessBoardMovement;
      movement.mate
        ? this.handleCheckMate(movement.color)
        : this.saveCurrentChessBoardState(movement.fen);
    }

    this.dispatchMessage(message);
  }

  private handleCheckMate(color: ChessPieceColor): void {
    this.clearPreviousChessBoardState();
    this.notificationService
      .notifyCheckmate(color)
      .subscribe((newMatch: boolean) => {
        if (newMatch) {
          this.handleReset();
        }
      });
  }

  private handleReset(): void {
    this.clearPreviousChessBoardState();
    this.dispatchMessage({
      frameId: this.frameId,
      type: MessageType.RESET,
    });
  }

  private dispatchMessage(message: Message): void {
    for (let frame in this.frames) {
      if (frame && frame !== message.frameId) {
        this.sendMessage(message, this.frames[frame]);
      }
    }
  }

  private registerIframe(event: any): void {
    const { data, source } = event;
    this.frames[data.frameId] = source;
    this.framesRegistered++;
    if (this.framesRegistered === 2) {
      this.checkForPreviousMatch();
    }
  }

  private checkForPreviousMatch(): void {
    const fen = this.retrievePreviousChessBoardState();
    if (fen) {
      this.notificationService
        .restorePreviousMatch()
        .subscribe((restore: boolean) => {
          if (restore) {
            this.dispatchMessage({
              frameId: this.frameId,
              type: MessageType.RESUME,
              payload: fen,
            });
          }
        });
    }
  }

  private isMessageValid(message: Message): boolean {
    return !!message.frameId && !!message.type;
  }

  private saveCurrentChessBoardState(fen: string): void {
    localStorage.setItem(this.CHESS_MATE_STATUS, fen);
  }

  private retrievePreviousChessBoardState(): string | null {
    return localStorage.getItem(this.CHESS_MATE_STATUS);
  }

  private clearPreviousChessBoardState(): void {
    localStorage.removeItem(this.CHESS_MATE_STATUS);
  }
}
