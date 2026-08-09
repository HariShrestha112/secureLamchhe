import { Component } from '@angular/core';
import { InfoService } from './info.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div style="padding: 20px;">
      <button (click)="submitData()">Send Info to Java Backend</button>
    </div>
  `
})
export class AppComponent {
  constructor(private infoService: InfoService) {}

  submitData() {
    this.infoService.sendInformation('Hello from Angular Angular!').subscribe({
      next: (response) => console.log('Response received:', response),
      error: (error) => console.error('Error occurred:', error)
    });
  }
}