import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CommunicationService } from './communication-service';
import { Message } from '../model/message';
import { MessageType } from '../model/message-type';
import { ChessBoardMovement } from '../model/movement';

@Injectable({
  providedIn: 'root',
})
export class FrameCommunicationService implements CommunicationService {
  private readonly onMoveSubject = new Subject<ChessBoardMovement>();
  private readonly onResetSubject = new Subject<void>();
  private readonly onCheckMateSubject = new Subject<ChessBoardMovement>();
  private readonly frames: any = {};
  private frameId!: string;

  constructor() {
    this.listenToMessages();
    this.initFrame();
  }

  move(movement: any): void {
    this.sendMessage({ type: MessageType.MOVE, payload: movement });
  }

  reset(): void {
    this.dispatchMessage({ frameId: 'mainPage', type: MessageType.RESET });
    this.sendMessage({ type: MessageType.RESET });
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

  private initFrame(): void {
    if (this.isIframe()) {
      this.frameId = this.frameId || Date.now().toString();
      this.sendMessage({ type: MessageType.INIT });
    }
  }

  private sendMessage(message: Partial<Message>, target = window.parent): void {
    message.frameId = message.frameId || this.frameId;
    target.postMessage(message, window.location.origin);
  }

  private listenToMessages(): void {
    window.addEventListener('message', (event) => {
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
        this.onMoveSubject.next(message.payload);
        break;
      }
      case MessageType.RESET: {
        this.onResetSubject.next();
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

  private isIframe(): boolean {
    return window.parent !== window.self;
  }

  private isMessageValid(message: Message): boolean {
    return !!message.frameId && !!message.type;
  }
}
