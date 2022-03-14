import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ChessBoardMovement } from 'src/app/model/movement';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';
import { WindowMock } from 'src/teste-utils';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let windowMock: Window;

  const frameCommunicationService = {
    onCheckMate: () => new Subject<ChessBoardMovement>().asObservable(),
    restorePrevious: () => {},
    reset: () => {},
  };

  beforeEach(async () => {
    windowMock = WindowMock as any;
    await TestBed.configureTestingModule({
      declarations: [MainComponent],
      providers: [
        {
          provide: FrameCommunicationService,
          useValue: frameCommunicationService,
        },
        { provide: 'Window', useFactory: () => windowMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe for "onCheckMate" event', () => {
    spyOn(frameCommunicationService, 'onCheckMate').and.callThrough();
    component.ngOnInit();
    expect(frameCommunicationService.onCheckMate).toHaveBeenCalled();
  });

  it('should check for restore previous state on afterViewChecked method', () => {
    spyOn(frameCommunicationService, 'restorePrevious').and.stub();
    component.ngAfterViewChecked();
    expect(frameCommunicationService.restorePrevious).toHaveBeenCalledTimes(1);
  });

  it('should call reset service method on reset', () => {
    spyOn(frameCommunicationService, 'reset').and.stub();
    component.reset();
    expect(frameCommunicationService.reset).toHaveBeenCalledTimes(1);
  });

  it('should display an alert on checkMate event', () => {
    const subject = new Subject<ChessBoardMovement>();
    spyOn(frameCommunicationService, 'onCheckMate').and.returnValue(
      subject.asObservable()
    );
    spyOn(window, 'alert').and.stub();

    component.ngOnInit();
    subject.next({ color: 'black' } as ChessBoardMovement);

    expect(frameCommunicationService.onCheckMate).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledOnceWith(
      'The black pieces have won the match!'
    );
  });

  it('should call reset service method on checkMate event', () => {
    const subject = new Subject<ChessBoardMovement>();

    spyOn(window, 'alert').and.stub();
    spyOn(frameCommunicationService, 'reset').and.stub();
    spyOn(frameCommunicationService, 'onCheckMate').and.returnValue(
      subject.asObservable()
    );

    component.ngOnInit();
    subject.next({ color: 'black' } as ChessBoardMovement);

    expect(frameCommunicationService.onCheckMate).toHaveBeenCalled();
    expect(frameCommunicationService.reset).toHaveBeenCalledTimes(1);
  });
});
