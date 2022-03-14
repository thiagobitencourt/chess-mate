import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindowMock } from 'src/teste-utils';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let windowMock: Window;

  beforeEach(async () => {
    windowMock = WindowMock as any;
    await TestBed.configureTestingModule({
      declarations: [MainComponent],
      providers: [{ provide: 'Window', useFactory: () => windowMock }],
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
});
