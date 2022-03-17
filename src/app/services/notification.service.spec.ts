import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { ChessPieceColor } from '../model/movement';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  const confirmationMock = jasmine.createSpyObj('ConfirmationService', [
    'confirm',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConfirmationService,
          useValue: confirmationMock,
        },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the confirmation service', () => {
    service.notifyCheckmate(ChessPieceColor.WHITE).subscribe();
    service.resetMatch().subscribe();
    service.restorePreviousMatch().subscribe();

    expect(confirmationMock.confirm).toHaveBeenCalledTimes(3);
  });
});
