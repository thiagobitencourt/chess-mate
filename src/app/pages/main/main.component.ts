import { Component, OnInit } from '@angular/core';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  constructor(private frameCommunication: FrameCommunicationService) {}

  ngOnInit(): void {}
}
