import { Injectable, Inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Message } from '../model/message';
import { MessageType } from '../model/message-type';
import { ChessBoardMovement } from '../model/movement';

@Injectable({
  providedIn: 'root',
})
export class FrameCommunicationService {
  private readonly onMoveSubject = new Subject<ChessBoardMovement>();
  private readonly onResetSubject = new Subject<void>();
  private readonly onCheckMateSubject = new Subject<ChessBoardMovement>();
  private readonly onResumeSubject = new Subject<string>();

  private readonly CHESS_MATE_STATUS = 'CHESS_MATE_STATUS';
  private readonly frames: any = {};
  private frameId!: string;

  constructor(@Inject('Window') private window: Window) {
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
    this.clearPreviousChessBoardState();
    this.dispatchMessage({ frameId: this.frameId, type: MessageType.RESET });
  }

  restorePrevious(): void {
    const fen = this.retrievePreviousChessBoardState();
    if (fen) {
      this.dispatchMessage({
        frameId: this.frameId,
        type: MessageType.RESUME,
        payload: fen,
      });
    }
  }

  onMove(): Observable<any> {
    return this.onMoveSubject.asObservable();
  }

  onReset(): Observable<any> {
    return this.onResetSubject.asObservable();
  }

  onCheckMate(): Observable<ChessBoardMovement> {
    return this.onCheckMateSubject.asObservable();
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
      if (movement.mate) {
        this.onCheckMateSubject.next(movement);
        this.clearPreviousChessBoardState();
      } else {
        this.saveCurrentChessBoardState(movement.fen);
      }
    }

    this.dispatchMessage(message);
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
