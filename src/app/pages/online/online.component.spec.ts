import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RealTimeCommunicationService } from 'src/app/services/real-time-communication.service';

import { OnlineComponent } from './online.component';

describe('OnlineComponent', () => {
  let component: OnlineComponent;
  let fixture: ComponentFixture<OnlineComponent>;

  beforeEach(async () => {
    const rtCommunication = {
      createMatch() {},
      joinMatch(matchCode: string) {},
    };

    await TestBed.configureTestingModule({
      declarations: [OnlineComponent],
      providers: [
        { provide: RealTimeCommunicationService, useValue: rtCommunication },
      ],
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
});
