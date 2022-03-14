import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IframeComponent } from './iframe.component';
import { WindowMock } from 'src/teste-utils';

describe('IframeComponent', () => {
  let component: IframeComponent;
  let fixture: ComponentFixture<IframeComponent>;
  let windowMock: Window;

  beforeEach(async () => {
    windowMock = WindowMock as any;
    await TestBed.configureTestingModule({
      declarations: [IframeComponent],
      providers: [{ provide: 'Window', useFactory: () => windowMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
