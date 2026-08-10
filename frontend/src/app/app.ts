import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InfoService } from './info.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Secure Lamchhe Clothing and Sewing Customer Portal');

  constructor(private info: InfoService, private router: Router) {}

  isLogged() {
    return !!this.info.loadStoredUser();
  }

  logout() {
    this.info.logout();
    this.router.navigate(['/login']);
  }
}
