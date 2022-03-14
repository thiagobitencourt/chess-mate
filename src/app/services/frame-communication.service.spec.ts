import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { WindowMock } from 'src/teste-utils';
import { MessageType } from '../model/message-type';
import { ChessBoardMovement } from '../model/movement';
import { FrameCommunicationService } from './frame-communication.service';

describe('FrameCommunicationService', () => {
  let service: FrameCommunicationService;
  let windowMock: any;

  beforeEach(() => {
    windowMock = WindowMock;
    TestBed.configureTestingModule({
      imports: [NgxChessBoardModule.forRoot()],
      providers: [{ provide: 'Window', useFactory: () => WindowMock }],
    });
    service = TestBed.inject(FrameCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should listen for post messages', () => {
    spyOn(windowMock, 'addEventListener').and.stub();
    service = TestBed.inject(FrameCommunicationService);
    service.init();

    expect(windowMock.addEventListener).toHaveBeenCalled();
  });

  it('should register the iframe to the parent window', () => {
    spyOn(windowMock.parent, 'postMessage').and.stub();
    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(true);
    service.init();

    expect(windowMock.parent.postMessage).toHaveBeenCalledWith(
      { frameId: jasmine.any(String), type: MessageType.INIT },
      windowMock.location.origin
    );
  });

  it('should NOT register the iframe to the parent window when it is already the parent/main page', () => {
    spyOn(windowMock.parent, 'postMessage').and.stub();
    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(false);
    service.init();

    expect(windowMock.parent.postMessage).not.toHaveBeenCalledWith(
      { frameId: jasmine.any(String), type: MessageType.INIT },
      windowMock.location.origin
    );
  });

  it('should send "MOVE" message to parent', () => {
    const movement = { move: 'a1b1', color: 'white' } as ChessBoardMovement;
    const message = {
      type: MessageType.MOVE,
      payload: movement,
      frameId: jasmine.any(String),
    };

    spyOn(windowMock.parent, 'postMessage').and.stub();
    service = TestBed.inject(FrameCommunicationService);
    service.move(movement);

    expect(windowMock.parent.postMessage).toHaveBeenCalledWith(
      message,
      windowMock.location.origin
    );
  });

  it('should handle the MOVE message in the iframe page', (done: any) => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(true);

    service.onMove().subscribe((movement: ChessBoardMovement) => {
      expect(movement.move).toBe('a1b2');
      done();
    });

    service.init();
    expect(handler).not.toBeNull();

    if (!!handler) {
      (handler as (e: any) => void)({
        data: {
          frameId: 'any-id',
          type: MessageType.MOVE,
          payload: { move: 'a1b2' },
        },
      });
    }
  });

  it('should handle the RESET message in the iframe page', (done: any) => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(true);

    service.onReset().subscribe(done);
    service.init();
    expect(handler).not.toBeNull();

    if (!!handler) {
      (handler as (e: any) => void)({
        data: {
          frameId: 'any-id',
          type: MessageType.RESET,
        },
      });
    }
  });

  it('should handle the RESUME message in the iframe page', (done: any) => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(true);

    service.onResume().subscribe(done);
    service.init();
    expect(handler).not.toBeNull();

    if (!!handler) {
      (handler as (e: any) => void)({
        data: {
          frameId: 'any-id',
          type: MessageType.RESUME,
        },
      });
    }
  });

  it('should IGNORE message without valid id', () => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(true);

    const onMove = jasmine.createSpy('onMove');
    const onReset = jasmine.createSpy('onReset');
    const onResume = jasmine.createSpy('onResume');

    service.onMove().subscribe(onMove);
    service.onReset().subscribe(onReset);
    service.onResume().subscribe(onResume);

    service.init();
    expect(handler).not.toBeNull();

    if (!!handler) {
      (handler as (e: any) => void)({
        data: {
          // missing id
          type: MessageType.RESUME,
        },
      });
    }

    expect(onMove).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
    expect(onResume).not.toHaveBeenCalled();
  });

  it('should IGNORE message without type', () => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(true);

    const onMove = jasmine.createSpy('onMove');
    const onReset = jasmine.createSpy('onReset');
    const onResume = jasmine.createSpy('onResume');

    service.onMove().subscribe(onMove);
    service.onReset().subscribe(onReset);
    service.onResume().subscribe(onResume);

    service.init();
    expect(handler).not.toBeNull();

    if (!!handler) {
      (handler as (e: any) => void)({
        data: {
          frameId: 'any-id',
          // missing type
        },
      });
    }

    expect(onMove).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
    expect(onResume).not.toHaveBeenCalled();
  });

  it('should spread MOVE message across registered iframes', () => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(false);
    service.init();

    expect(handler).not.toBeNull();

    const frame1 = 'id-frame-1';
    const frame2 = 'id-frame-2';
    const source = { postMessage: jasmine.createSpy('postMessage') };
    const moveMessage = {
      frameId: 'any-id',
      type: MessageType.MOVE,
      payload: { move: 'a1b2' },
    };

    if (!!handler) {
      // Init message to register frames
      const data1 = { frameId: frame1, type: MessageType.INIT };
      const data2 = { frameId: frame2, type: MessageType.INIT };

      (handler as (e: any) => void)({
        data: data1,
        source,
      });

      (handler as (e: any) => void)({
        data: data2,
        source,
      });

      // MOVE message dispatch
      (handler as (e: any) => void)({
        data: moveMessage,
      });
    }

    expect(source.postMessage).toHaveBeenCalledTimes(2);
    expect(source.postMessage).toHaveBeenCalledWith(
      moveMessage,
      windowMock.location.origin
    );
  });

  it('should save chess board state on every move', () => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    spyOn(localStorage, 'setItem').and.stub();

    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(false);
    service.init();

    expect(handler).not.toBeNull();

    const moveMessage = {
      frameId: 'any-id',
      type: MessageType.MOVE,
      payload: { move: 'a1b2', fen: 'abcde' },
    };

    if (!!handler) {
      // MOVE message dispatch
      (handler as (e: any) => void)({
        data: moveMessage,
      });
    }

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'CHESS_MATE_STATUS',
      moveMessage.payload.fen
    );
  });

  it('should emit the "onCheckMate" subscription when a player win the match', (done: any) => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    spyOn(localStorage, 'removeItem').and.stub();
    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(false);

    service.onCheckMate().subscribe((movement: ChessBoardMovement) => {
      expect(movement.move).toBe('a1b2');
      expect(movement.mate).toBeTrue();
      done();
    });

    service.init();
    expect(handler).not.toBeNull();

    if (!!handler) {
      (handler as (e: any) => void)({
        data: {
          frameId: 'any-id',
          type: MessageType.MOVE,
          payload: { move: 'a1b2', mate: true },
        },
      });
    }

    expect(localStorage.removeItem).toHaveBeenCalledWith('CHESS_MATE_STATUS');
  });

  it('should dispatch "Reset" message and clear the chess board state', () => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    spyOn(localStorage, 'removeItem').and.stub();
    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(false);

    service.init();
    expect(handler).not.toBeNull();

    const frame1 = 'id-frame-1';
    const frame2 = 'id-frame-2';
    const source = { postMessage: jasmine.createSpy('postMessage') };
    const resetMessage = {
      frameId: jasmine.any(String),
      type: MessageType.RESET,
    };

    if (!!handler) {
      // Init message to register frames
      const data1 = { frameId: frame1, type: MessageType.INIT };
      const data2 = { frameId: frame2, type: MessageType.INIT };

      (handler as (e: any) => void)({
        data: data1,
        source,
      });

      (handler as (e: any) => void)({
        data: data2,
        source,
      });
    }

    service.reset();

    expect(localStorage.removeItem).toHaveBeenCalledWith('CHESS_MATE_STATUS');
    expect(source.postMessage).toHaveBeenCalledTimes(2);
    expect(source.postMessage).toHaveBeenCalledWith(
      resetMessage,
      windowMock.location.origin
    );
  });

  it('should dispatch "Resume" message when there is a previous chess board state on localstorage', () => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    spyOn(localStorage, 'getItem').and.returnValue('fen-exists');
    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(false);

    service.init();
    expect(handler).not.toBeNull();

    const frame1 = 'id-frame-1';
    const frame2 = 'id-frame-2';
    const source = { postMessage: jasmine.createSpy('postMessage') };
    const resumeMessage = {
      frameId: jasmine.any(String),
      type: MessageType.RESUME,
      payload: 'fen-exists',
    };

    if (!!handler) {
      // Init message to register frames
      const data1 = { frameId: frame1, type: MessageType.INIT };
      const data2 = { frameId: frame2, type: MessageType.INIT };

      (handler as (e: any) => void)({
        data: data1,
        source,
      });

      (handler as (e: any) => void)({
        data: data2,
        source,
      });
    }

    service.restorePrevious();

    expect(localStorage.getItem).toHaveBeenCalledWith('CHESS_MATE_STATUS');
    expect(source.postMessage).toHaveBeenCalledTimes(2);
    expect(source.postMessage).toHaveBeenCalledWith(
      resumeMessage,
      windowMock.location.origin
    );
  });

  it('should NOT dispatch "Resume" message when there is NO previous chess board state on localstorage', () => {
    let handler: ((ev: any) => void) | null = null;
    spyOn(windowMock, 'addEventListener').and.callFake(
      (event: string, messageHandler: (ev: any) => void) => {
        handler = messageHandler;
      }
    );

    spyOn(localStorage, 'getItem').and.returnValue(null);
    service = TestBed.inject(FrameCommunicationService);
    spyOn(service, 'isIframe').and.returnValue(false);

    service.init();
    expect(handler).not.toBeNull();

    const frame1 = 'id-frame-1';
    const frame2 = 'id-frame-2';
    const source = { postMessage: jasmine.createSpy('postMessage') };

    if (!!handler) {
      // Init message to register frames
      const data1 = { frameId: frame1, type: MessageType.INIT };
      const data2 = { frameId: frame2, type: MessageType.INIT };

      (handler as (e: any) => void)({
        data: data1,
        source,
      });

      (handler as (e: any) => void)({
        data: data2,
        source,
      });
    }

    service.restorePrevious();

    expect(localStorage.getItem).toHaveBeenCalledWith('CHESS_MATE_STATUS');
    expect(source.postMessage).not.toHaveBeenCalled();
  });
});
