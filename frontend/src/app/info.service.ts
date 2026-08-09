import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  facebook: string;
  address?: string;
  contact?: string;
  bio?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private readonly loginUrl = 'http://localhost:8080/api/login';
  private readonly infoUrl = 'http://localhost:8080/api/send-info';
  private readonly storageKey = 'userProfile';

  user: UserProfile | null = null;

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  sendInformation(infoText: string): Observable<any> {
    return this.http.post<any>(this.infoUrl, { info: infoText });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { username, password }).pipe(
      tap((response) => {
        if (response.success && response.profile) {
          this.user = response.profile;
          if (typeof window !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(response.profile));
          }
        }
      })
    );
  }

  loadStoredUser(): UserProfile | null {
    if (this.user) {
      return this.user;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.user = JSON.parse(stored) as UserProfile;
    }

    return this.user;
  }

  logout(): void {
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}
