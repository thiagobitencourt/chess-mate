import { TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subject } from 'rxjs';
import { OnlineMessage } from '../model/online-message';
import { ChessMatch } from './chess-match';

import { RealTimeCommunicationService } from './real-time-communication.service';

describe('RealTimeCommunicationService', () => {
  let service: RealTimeCommunicationService;
  const databaseObjectSubject = new Subject<OnlineMessage | null>();
  const angularFireObject = {
    update(message: OnlineMessage) {},
    set(message: OnlineMessage) {},
    valueChanges: () => databaseObjectSubject.asObservable(),
  };
  const database = { object: () => angularFireObject } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AngularFireDatabase, useValue: database }],
    });
    service = TestBed.inject(RealTimeCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create and return a match object', () => {
    const match = service.createMatch();
    expect(match).toBeInstanceOf(ChessMatch);
    expect(match.code).toBeTruthy();
  });

  it('should join and return a match object', () => {
    const match = service.joinMatch('A1B2C3');
    expect(match).toBeInstanceOf(ChessMatch);
    expect(match.code).toBe('A1B2C3');
  });
});
