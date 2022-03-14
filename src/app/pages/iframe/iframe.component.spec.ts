import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject, of } from 'rxjs';
import { IframeComponent } from './iframe.component';
import { WindowMock } from 'src/teste-utils';
import { ChessBoardMovement } from 'src/app/model/movement';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';

describe('IframeComponent', () => {
  let component: IframeComponent;
  let fixture: ComponentFixture<IframeComponent>;
  let windowMock: Window;

  const frameCommunicationService = {
    onMove: () => new Subject<ChessBoardMovement>().asObservable(),
    onReset: () => new Subject<void>().asObservable(),
    onResume: () => new Subject<string>().asObservable(),
    move: (move: ChessBoardMovement) => {},
  };

  const boardMock = jasmine.createSpyObj('board', ['reset', 'move', 'setFEN']);

  beforeEach(async () => {
    windowMock = WindowMock as any;
    await TestBed.configureTestingModule({
      declarations: [IframeComponent],
      providers: [
        {
          provide: FrameCommunicationService,
          useValue: frameCommunicationService,
        },
        { provide: 'Window', useFactory: () => windowMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeComponent);
    component = fixture.componentInstance;
    component.board = boardMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set "started" property to false', () => {
    expect(component.started).toBeFalse();
  });

  it('should NOT disabled any pieces before match starts', () => {
    expect(component.lightDisabled).toBeFalse();
    expect(component.darkDisabled).toBeFalse();
  });

  it('should be listening the service events', () => {
    spyOn(frameCommunicationService, 'onMove').and.returnValue(of());
    spyOn(frameCommunicationService, 'onReset').and.returnValue(of());
    spyOn(frameCommunicationService, 'onResume').and.returnValue(of());

    component.ngOnInit();
    expect(frameCommunicationService.onMove).toHaveBeenCalledTimes(1);
    expect(frameCommunicationService.onReset).toHaveBeenCalledTimes(1);
    expect(frameCommunicationService.onResume).toHaveBeenCalledTimes(1);
  });

  it('should disable the "black" pieces when the first move was a "white" piece', () => {
    component.move({ move: 'a1b2', color: 'white' });

    expect(component.started).toBeTrue();
    expect(component.darkDisabled).toBeTrue();
    expect(component.lightDisabled).toBeFalse();
  });

  it('should disable the "white" pieces when the first move was a "black" piece', () => {
    component.move({ move: 'a1b2', color: 'black' });

    expect(component.started).toBeTrue();
    expect(component.darkDisabled).toBeFalse();
    expect(component.lightDisabled).toBeTrue();
  });

  it('should keep the disable configuration for every move after the first one', () => {
    component.move({ move: 'a1b2', color: 'black' });

    expect(component.started).toBeTrue();
    expect(component.darkDisabled).toBeFalse();
    expect(component.lightDisabled).toBeTrue();

    component.move({ move: 'a2b3', color: 'white' });
    expect(component.started).toBeTrue();
    expect(component.darkDisabled).toBeFalse();
    expect(component.lightDisabled).toBeTrue();
  });

  it('should call the service move event to replicate the chess board move', () => {
    spyOn(frameCommunicationService, 'move').and.stub();

    const movement = { move: 'a1b2', color: 'black' } as ChessBoardMovement;
    component.move(movement);

    expect(frameCommunicationService.move).toHaveBeenCalledWith(movement);
  });

  it('should ignore the move if there was the opponent move', () => {
    spyOn(frameCommunicationService, 'move').and.stub();

    component.justMuvedByOpponent = true;
    component.move({ move: 'a1b2', color: 'black' });

    expect(component.justMuvedByOpponent).toBeFalse();
    expect(frameCommunicationService.move).not.toHaveBeenCalled();
  });

  it('should handle the "reset" board event', () => {
    const subject = new Subject<void>();
    spyOn(frameCommunicationService, 'onReset').and.returnValue(
      subject.asObservable()
    );

    component.started = true;
    component.darkDisabled = true;
    component.lightDisabled = true;

    component.ngOnInit();
    component.board = boardMock;
    subject.next();

    expect(component.board.reset).toHaveBeenCalled();
    expect(component.started).toBeFalse();
    expect(component.darkDisabled).toBeFalse();
    expect(component.lightDisabled).toBeFalse();
  });

  it('should handle the "resume" board event', () => {
    const subject = new Subject<string>();
    spyOn(frameCommunicationService, 'onResume').and.returnValue(
      subject.asObservable()
    );

    component.ngOnInit();
    component.board = boardMock;
    subject.next('abcde');

    expect(component.board.setFEN).toHaveBeenCalledWith('abcde');
  });

  it('should handle the opponent "move" event', () => {
    const subject = new Subject<ChessBoardMovement>();
    spyOn(frameCommunicationService, 'onMove').and.returnValue(
      subject.asObservable()
    );

    component.ngOnInit();
    component.board = boardMock;
    subject.next({ move: 'a1b2', color: 'black' } as ChessBoardMovement);

    expect(component.justMuvedByOpponent).toBeTrue();
    expect(component.started).toBeTrue();
    expect(component.darkDisabled).toBeTrue();
    expect(component.lightDisabled).toBeFalse();
    expect(component.board.move).toHaveBeenCalledWith('a1b2');
  });
});
