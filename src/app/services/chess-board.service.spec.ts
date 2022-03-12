import { TestBed } from '@angular/core/testing';

import { ChessBoardService } from './chess-board.service';

describe('ChessBoardService', () => {
  let service: ChessBoardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessBoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
