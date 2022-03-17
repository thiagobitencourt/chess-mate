import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  const frameCommunicationService = jasmine.createSpyObj(
    'frameCommunicationService',
    ['reset']
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [MainComponent, HeaderComponent],
      providers: [
        {
          provide: FrameCommunicationService,
          useValue: frameCommunicationService,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  it('should call reset service method on reset', () => {
    component.reset();
    expect(frameCommunicationService.reset).toHaveBeenCalledTimes(1);
  });
});
