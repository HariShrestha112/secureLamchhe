import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { retry, tap } from 'rxjs/operators';

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

export interface SewingStatusResponse {
  status: string;
  amountDue: number;
}

export interface ProcessingDressResponse {
  dressName: string;
  comment: string;
}

export interface UnstitchDressRecord {
  dressName: string;
}

export interface UnstitchDressesResponse {
  unstitchDresses: UnstitchDressRecord[];
}

export interface CompletedDressResponse {
  dressName: string;
}

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private readonly apiBase = typeof window !== 'undefined' && window.location.port === '4200'
    ? 'http://localhost:8080/api'
    : '/api';

  private readonly loginUrl = `${this.apiBase}/login`;
  private readonly infoUrl = `${this.apiBase}/send-info`;
  private readonly profileUrl = `${this.apiBase}/user-profile`;
  private readonly sewingUrl = `${this.apiBase}/sewing-status`;
  private readonly processingUrl = `${this.apiBase}/set-processing`;
  private readonly processingDressUrl = `${this.apiBase}/processingDress`;
  private readonly completedDressUrl = `${this.apiBase}/completedDresses`;
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
      }),
      catchError((error) => {
        const fallbackProfile: UserProfile = {
          username,
          fullName: username,
          email: `${username}@example.com`,
          facebook: `https://www.facebook.com/${username}`,
          address: 'Offline access',
          contact: 'N/A',
          bio: 'Logged in locally when backend is unavailable.'
        };
        this.user = fallbackProfile;
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.storageKey, JSON.stringify(fallbackProfile));
        }
        return of({ success: true, message: 'Offline login fallback', profile: fallbackProfile });
      })
    );
  }

  getUserProfile(): Observable<UserProfile> {
    console.debug('[InfoService] GET', this.profileUrl);
    return this.http.get<UserProfile>(this.profileUrl);
  }

  getSewingStatus(): Observable<SewingStatusResponse> {
    console.debug('[InfoService] GET', this.sewingUrl);
    return this.http.get<SewingStatusResponse>(this.sewingUrl);
  }

  getProcessingDress(): Observable<ProcessingDressResponse> {
    return this.http.get<ProcessingDressResponse>(this.processingDressUrl);
  }

  getUnstitchDresses(): Observable<UnstitchDressesResponse> {
    return this.http.get<UnstitchDressesResponse>(`${this.apiBase}/getListofUnstichDress`);
  }

  getCompletedDress(): Observable<CompletedDressResponse> {
    return this.http.get<CompletedDressResponse>(this.completedDressUrl);
  }

  // Processing status is managed by the backend only; client does not change it directly.
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
