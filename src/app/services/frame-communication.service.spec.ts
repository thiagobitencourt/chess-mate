import { TestBed } from '@angular/core/testing';

import { FrameCommunicationService } from './frame-communication.service';

describe('FrameCommunicationService', () => {
  let service: FrameCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrameCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
