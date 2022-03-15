import { TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';

import { RealTimeCommunicationService } from './real-time-communication.service';

describe('RealTimeCommunicationService', () => {
  let service: RealTimeCommunicationService;
  let mockDb;

  beforeEach(() => {
    mockDb = {};
    TestBed.configureTestingModule({
      providers: [{ provide: AngularFireDatabase, useValue: mockDb }],
    });
    service = TestBed.inject(RealTimeCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
