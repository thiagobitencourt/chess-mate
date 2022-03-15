import { TestBed } from '@angular/core/testing';

import { RealTimeCommunicationService } from './real-time-communication.service';

describe('RealTimeCommunicationService', () => {
  let service: RealTimeCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealTimeCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
