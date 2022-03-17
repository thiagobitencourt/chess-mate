import { Component } from '@angular/core';
import { FrameCommunicationService } from 'src/app/services/frame-communication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  constructor(private frameCommunication: FrameCommunicationService) {}

  reset(): void {
    this.frameCommunication.reset();
  }
}
