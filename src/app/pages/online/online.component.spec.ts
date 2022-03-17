import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ChessBoardMovement, ChessPieceColor } from 'src/app/model/movement';
import { OnlineMessage } from 'src/app/model/online-message';
import { ChessMatch } from 'src/app/services/chess-match';
import { NotificationService } from 'src/app/services/notification.service';
import { RealTimeCommunicationService } from 'src/app/services/real-time-communication.service';
import { OnlineComponent } from './online.component';

describe('OnlineComponent', () => {
  let component: OnlineComponent;
  let fixture: ComponentFixture<OnlineComponent>;

  const playerJoinedSubject = new Subject<boolean>();
  const checkMateSubject = new Subject<boolean>();
  const playerLeftSubject = new Subject<boolean>();

  const notificationMock = {
    notifyPlayerJoined: () => playerJoinedSubject.asObservable(),
    notifyCheckmateOnline: (color: ChessPieceColor) =>
      checkMateSubject.asObservable(),
    notifyPlayerLeft: () => playerLeftSubject.asObservable(),
  };

  const matchCodeMock = 'A1B2C3';
  const databaseObjectSubject = new Subject<OnlineMessage | null>();
  const angularFireObject = {
    update(message: OnlineMessage) {},
    set(message: OnlineMessage) {},
    valueChanges: () => databaseObjectSubject.asObservable(),
  };
  const database = { object: () => angularFireObject } as any;
  const rtCommunication = new RealTimeCommunicationService(database);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [OnlineComponent, HeaderComponent],
      providers: [
        { provide: NotificationService, useValue: notificationMock },
        { provide: AngularFireDatabase, useValue: database },
        { provide: RealTimeCommunicationService, useValue: rtCommunication },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have a match setted in the start up', () => {
    expect(component.match).toBeFalsy();
  });

  it('should display only the create/join game section if a match is not yet created', () => {
    const createJoinGameElement = fixture.debugElement.query(
      By.css('#create-game')
    );
    const chessBoard = fixture.debugElement.query(By.css('#chess-board'));

    expect(createJoinGameElement).toBeTruthy();
    expect(chessBoard).toBeFalsy();
  });

  it('should display only the game board section after the match is created', () => {
    component.match = {} as ChessMatch;
    fixture.detectChanges();

    const createJoinGameElement = fixture.debugElement.query(
      By.css('#create-game')
    );
    const chessBoard = fixture.debugElement.query(By.css('#chess-board'));

    expect(createJoinGameElement).toBeFalsy();
    expect(chessBoard).toBeTruthy();
  });

  it('should display the match code after the match is created or joined', () => {
    component.match = { code: matchCodeMock } as ChessMatch;
    fixture.detectChanges();

    const codeElement = fixture.debugElement.query(By.css('.code'));
    expect(codeElement).toBeTruthy();
    expect(codeElement.nativeElement.innerText).toBe(matchCodeMock);
  });

  it('should block both "sides" of the board: black and white pieces', () => {
    expect(component.darkDisabled).toBeTrue();
    expect(component.lightDisabled).toBeTrue();
  });

  it('should create a new chess match', () => {
    component.newMatch();
    expect(component.match).toBeDefined();
    expect(component.match?.owner).toBeTrue();
  });

  it('should copy the match code to the clipboard', () => {
    component.match = { code: matchCodeMock } as ChessMatch;
    spyOn(navigator.clipboard, 'writeText').and.stub();

    component.copyCode();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(matchCodeMock);
  });

  it('should not break when null is returned from createMatch method', () => {
    spyOn(rtCommunication, 'createMatch').and.returnValue(null as any);
    component.newMatch();
    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(component.match).toBeNull();
  });

  it('should listen to onJoined event for match owner', () => {
    const match = {
      owner: true,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    component.newMatch();

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(match.onJoined).toHaveBeenCalled();
  });

  it('should listen to "common" events: onMove and onLeft when creating a match', () => {
    const match = {
      owner: true,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    component.newMatch();

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(match.onMove).toHaveBeenCalled();
    expect(match.onLeft).toHaveBeenCalled();
  });

  it('should join a chess match by code', () => {
    component.joinMatch(matchCodeMock);
    expect(component.match).toBeDefined();
    expect(component.match?.owner).toBeFalse();
    expect(component.match?.code).toBe(matchCodeMock);
  });

  it('should NOT listen to onJoined event on joining a match', () => {
    const match = {
      owner: false,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'joinMatch').and.returnValue(match);
    component.joinMatch(matchCodeMock);

    expect(rtCommunication.joinMatch).toHaveBeenCalled();
    expect(match.onJoined).not.toHaveBeenCalled();
  });

  it('should listen to "common" events: onMove and onLeft when joining a match', () => {
    const match = {
      owner: false,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'joinMatch').and.returnValue(match);
    component.joinMatch(matchCodeMock);

    expect(rtCommunication.joinMatch).toHaveBeenCalled();
    expect(match.onMove).toHaveBeenCalled();
    expect(match.onLeft).toHaveBeenCalled();
  });

  it('should reset to initial values on leave the match', () => {
    const match = {
      leave: jasmine.createSpy('leave').and.stub(),
    } as any;

    component.match = match;
    component.leaveMatch();

    expect(match.leave).toHaveBeenCalled();
    expect(component.darkDisabled).toBeTrue();
    expect(component.lightDisabled).toBeTrue();
    expect(component.match).toBeNull();
  });

  it('should update the match move when a new move happens', () => {
    const match = {
      move: jasmine.createSpy('move').and.stub(),
    } as any;

    component.match = match;
    component.move({ move: 'a1b2' });

    expect(match.move).toHaveBeenCalledWith({ move: 'a1b2' });
  });

  it('should show a notification message when the move represents a checkmate', () => {
    const match = {
      move: jasmine.createSpy('move').and.stub(),
    } as any;
    spyOn(notificationMock, 'notifyCheckmateOnline').and.callThrough();

    const movement = { move: 'a1b2', color: 'white', mate: true };
    component.match = match;
    component.move(movement);

    expect(notificationMock.notifyCheckmateOnline).toHaveBeenCalledWith(
      ChessPieceColor.WHITE
    );
  });

  it('should reset to initial values after a checkmate', () => {
    const match = {
      move: jasmine.createSpy('move').and.stub(),
    } as any;

    const movement = { move: 'a1b2', color: 'white', mate: true };
    component.match = match;
    component.move(movement);

    checkMateSubject.next(true);
    expect(component.darkDisabled).toBeTrue();
    expect(component.lightDisabled).toBeTrue();
    expect(component.match).toBeNull();
  });

  it('should show a notification message when an opponent joins the match', () => {
    const joinedSubject = new Subject<void>();
    const match = {
      owner: true,
      onJoined: () => joinedSubject.asObservable(),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(notificationMock, 'notifyPlayerJoined').and.callThrough();
    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    component.newMatch();

    joinedSubject.next();

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(notificationMock.notifyPlayerJoined).toHaveBeenCalled();
  });

  it('should enable the white pieces when an opponent joins the match', () => {
    const joinedSubject = new Subject<void>();
    const match = {
      owner: true,
      onJoined: () => joinedSubject.asObservable(),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    component.newMatch();
    joinedSubject.next();
    playerJoinedSubject.next(true);

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(component.lightDisabled).toBeFalse();
  });

  it('should show a notification message when the opponent leave the match', () => {
    const leftSubject = new Subject<void>();
    const match = {
      owner: true,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: () => leftSubject.asObservable(),
    } as any;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    spyOn(notificationMock, 'notifyPlayerLeft').and.callThrough();

    component.newMatch();
    leftSubject.next();
    playerLeftSubject.next(true);

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(notificationMock.notifyPlayerLeft).toHaveBeenCalled();
  });

  it('should reset to initial values when the opponent leave the match', () => {
    const leftSubject = new Subject<void>();
    const match = {
      owner: true,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: jasmine.createSpy('onMove').and.returnValue(of()),
      onLeft: () => leftSubject.asObservable(),
    } as any;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    component.newMatch();
    leftSubject.next();
    playerLeftSubject.next(true);

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(component.darkDisabled).toBeTrue();
    expect(component.lightDisabled).toBeTrue();
    expect(component.match).toBeNull();
  });

  it('should enabled the black pieces after the opponents first move, when joined a match', () => {
    const moveSubject = new Subject<ChessBoardMovement>();
    const match = {
      owner: false,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: () => moveSubject.asObservable(),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'joinMatch').and.returnValue(match);
    component.board = { move: jasmine.createSpy('move') } as any;
    component.joinMatch(matchCodeMock);
    moveSubject.next({ move: 'a1v2' } as ChessBoardMovement);

    expect(rtCommunication.joinMatch).toHaveBeenCalled();
    expect(component.darkDisabled).toBeFalse();
  });

  it('should update the board with the opponents move', () => {
    const moveSubject = new Subject<ChessBoardMovement>();
    const match = {
      owner: true,
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: () => moveSubject.asObservable(),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);

    component.board = { move: jasmine.createSpy('move') } as any;
    component.newMatch();

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    moveSubject.next({ move: 'a1v2' } as ChessBoardMovement);

    expect(component.board.move).toHaveBeenCalledWith('a1v2');
  });

  it('should NOT replicate the opponents move', () => {
    const moveSubject = new Subject<ChessBoardMovement>();
    const match = {
      owner: true,
      move: jasmine.createSpy('move').and.stub(),
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: () => moveSubject.asObservable(),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;
    const movement = { move: 'a1v2' } as ChessBoardMovement;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    component.board = { move: jasmine.createSpy('move') } as any;
    component.newMatch();

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    moveSubject.next(movement);
    component.move(movement);

    expect(match.move).not.toHaveBeenCalled();
  });

  it('should ignore movement when message is null', () => {
    const moveSubject = new Subject<ChessBoardMovement>();
    const match = {
      owner: true,
      move: jasmine.createSpy('move').and.stub(),
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: () => moveSubject.asObservable(),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    component.board = { move: jasmine.createSpy('move') } as any;
    component.newMatch();

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    moveSubject.next(null as any);

    expect(component.board.move).not.toHaveBeenCalled();
  });

  it('should show a notification message when the opponents wins the match', () => {
    const moveSubject = new Subject<ChessBoardMovement>();
    const match = {
      owner: true,
      move: jasmine.createSpy('move').and.stub(),
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: () => moveSubject.asObservable(),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    const movement = { move: 'a1b2', color: 'black', mate: true };
    spyOn(rtCommunication, 'createMatch').and.returnValue(match);
    spyOn(notificationMock, 'notifyCheckmateOnline').and.callThrough();

    component.board = { move: jasmine.createSpy('move') } as any;
    component.newMatch();
    moveSubject.next(movement as ChessBoardMovement);

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(notificationMock.notifyCheckmateOnline).toHaveBeenCalled();
  });

  it('should reset to initial values when the opponents wins the match', () => {
    const moveSubject = new Subject<ChessBoardMovement>();
    const match = {
      owner: true,
      move: jasmine.createSpy('move').and.stub(),
      onJoined: jasmine.createSpy('onJoined').and.returnValue(of()),
      onMove: () => moveSubject.asObservable(),
      onLeft: jasmine.createSpy('onLeft').and.returnValue(of()),
    } as any;

    const movement = { move: 'a1b2', color: 'black', mate: true };
    spyOn(rtCommunication, 'createMatch').and.returnValue(match);

    component.board = { move: jasmine.createSpy('move') } as any;
    component.newMatch();
    moveSubject.next(movement as ChessBoardMovement);
    checkMateSubject.next(true);

    expect(rtCommunication.createMatch).toHaveBeenCalled();
    expect(component.darkDisabled).toBeTrue();
    expect(component.lightDisabled).toBeTrue();
    expect(component.match).toBeNull();
  });
});
