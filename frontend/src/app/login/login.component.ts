import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InfoService } from '../info.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private infoService: InfoService, private router: Router) {
    if (this.infoService.loadStoredUser()) {
      this.router.navigate(['/dashboard']);
    }
  }

  submit() {
    this.error = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Username and password cannot be empty.';
      return;
    }

    this.isLoading = true;
    this.infoService.login(this.username.trim(), this.password.trim()).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/dashboard']).catch((navErr) => {
            console.error('Navigation failed:', navErr);
            this.error = 'Navigation failed. Please try again.';
          });
        } else {
          this.error = response.message;
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Could not connect to the backend. Please try again.';
      }
    });
  }
}
