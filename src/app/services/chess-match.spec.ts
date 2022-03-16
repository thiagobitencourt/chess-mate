import { Subject } from 'rxjs';
import { ChessBoardMovement } from '../model/movement';
import { OnlineMessage } from '../model/online-message';
import { ChessMatch } from './chess-match';

describe('ChessMatch class', () => {
  const databaseObjectSubject = new Subject<OnlineMessage | null>();
  const angularFireObject = {
    update(message: OnlineMessage) {},
    set(message: OnlineMessage) {},
    valueChanges: () => databaseObjectSubject.asObservable(),
  };
  const database = { object: () => angularFireObject } as any;

  let chessMatch: ChessMatch;

  it('should not break on instantiate', () => {
    chessMatch = new ChessMatch(database);
    expect(chessMatch).toBeTruthy();
  });

  it('should set initial values when creating a new match object', () => {
    chessMatch = new ChessMatch(database);

    expect(chessMatch.code).toBeDefined();
    expect(chessMatch.owner).toBeTrue();
  });

  it('should create the database object when creating a new match', () => {
    spyOn(angularFireObject, 'set').and.stub();

    chessMatch = new ChessMatch(database);

    expect(chessMatch.code).toBeDefined();
    expect(chessMatch.owner).toBeTrue();
    expect(angularFireObject.set).toHaveBeenCalledWith({
      matchCode: chessMatch.code,
    } as OnlineMessage);
  });

  it('should set object listeners when creating a new match', () => {
    spyOn(angularFireObject, 'valueChanges').and.callThrough();
    chessMatch = new ChessMatch(database);

    expect(angularFireObject.valueChanges).toHaveBeenCalled();
  });

  it('should set initial values when joining a match', () => {
    chessMatch = new ChessMatch(database, 'A1B2C3');
    expect(chessMatch.code).toBe('A1B2C3');
    expect(chessMatch.owner).toBeFalse();
  });

  it('should set the database object when joining a match', () => {
    spyOn(angularFireObject, 'set').and.stub();

    chessMatch = new ChessMatch(database, 'A1B2C3');

    expect(chessMatch.code).toBe('A1B2C3');
    expect(chessMatch.owner).toBeFalse();
    expect(angularFireObject.set).toHaveBeenCalledWith({
      joined: true,
    } as OnlineMessage);
  });

  it('should update the database object on call move', () => {
    spyOn(angularFireObject, 'update').and.stub();
    const movement = { move: 'a1b1' } as ChessBoardMovement;
    chessMatch = new ChessMatch(database);
    chessMatch.move(movement);

    expect(angularFireObject.update).toHaveBeenCalledWith({ move: movement });
  });

  it('should not update the database with the stalemate property as undefined', (done) => {
    spyOn(angularFireObject, 'update').and.callFake((message) => {
      expect(message.move?.stalemate).toBeDefined();
      expect(message.move?.stalemate).toBeFalse();
      done();
    });

    const movement = { move: 'a1b1' } as ChessBoardMovement;
    chessMatch = new ChessMatch(database);
    chessMatch.move(movement);

    expect(angularFireObject.update).toHaveBeenCalled();
  });

  it('should update the database object on call leave', () => {
    spyOn(angularFireObject, 'update').and.stub();
    chessMatch = new ChessMatch(database);
    chessMatch.leave();

    expect(angularFireObject.update).toHaveBeenCalledWith({ left: true });
  });

  it('should update the database object with left property only once', () => {
    spyOn(angularFireObject, 'update').and.stub();
    chessMatch = new ChessMatch(database);
    // called leave twice
    chessMatch.leave();
    chessMatch.leave();

    expect(angularFireObject.update).toHaveBeenCalledTimes(1);
  });

  it('should emit the onJoined event when the joined property changes', () => {
    const callBack = jasmine.createSpy('callBackOnJoined');
    chessMatch = new ChessMatch(database);
    chessMatch.onJoined().subscribe(callBack);

    databaseObjectSubject.next({ joined: true });
    expect(callBack).toHaveBeenCalled();
  });

  it('should NOT emit the onJoined event for the instance that is joining a match', () => {
    const callBack = jasmine.createSpy('callBackOnJoined');
    chessMatch = new ChessMatch(database, 'A1B2C3');
    chessMatch.onJoined().subscribe(callBack);

    databaseObjectSubject.next({ joined: true });
    expect(callBack).not.toHaveBeenCalled();
  });

  it('should emit the onLeft event when the left property changes', () => {
    const callBack = jasmine.createSpy('callBackOnLeft');
    chessMatch = new ChessMatch(database);
    chessMatch.onLeft().subscribe(callBack);

    databaseObjectSubject.next({ left: true });
    expect(callBack).toHaveBeenCalled();
  });

  it('should NOT emit the onLeft event for the instance that call the leave method', () => {
    const callBack = jasmine.createSpy('callBackOnLeft');
    chessMatch = new ChessMatch(database);
    chessMatch.onLeft().subscribe(callBack);
    chessMatch.leave();

    databaseObjectSubject.next({ left: true });
    expect(callBack).not.toHaveBeenCalled();
  });

  it('should emit the onMove event when the move object changes', () => {
    const callBack = jasmine.createSpy('callBackOnMove');
    chessMatch = new ChessMatch(database);
    chessMatch.onMove().subscribe(callBack);

    const movement = { move: 'a1b2' };
    databaseObjectSubject.next({ move: movement } as OnlineMessage);
    expect(callBack).toHaveBeenCalledWith(movement);
  });

  it('should NOT emit the onMove event for the instance that call the move method', () => {
    const callBack = jasmine.createSpy('callBackOnMove');
    chessMatch = new ChessMatch(database);
    chessMatch.onMove().subscribe(callBack);
    const movement = { move: 'a1b2' };

    chessMatch.move(movement as ChessBoardMovement);

    databaseObjectSubject.next({ move: movement } as OnlineMessage);
    expect(callBack).not.toHaveBeenCalledWith(movement);
  });

  it('should not emit any event when the object is null', () => {
    const callBackOnMove = jasmine.createSpy('callBackOnMove');
    const callBackOnLeft = jasmine.createSpy('callBackOnLeft');
    const callBackOnJoined = jasmine.createSpy('callBackOnJoined');

    chessMatch = new ChessMatch(database);
    chessMatch.onMove().subscribe(callBackOnMove);
    chessMatch.onLeft().subscribe(callBackOnLeft);
    chessMatch.onJoined().subscribe(callBackOnJoined);

    databaseObjectSubject.next(null);
    expect(callBackOnMove).not.toHaveBeenCalled();
    expect(callBackOnLeft).not.toHaveBeenCalled();
    expect(callBackOnJoined).not.toHaveBeenCalled();
  });
});
