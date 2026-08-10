import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InfoService, UserProfile } from '../info.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  profile: UserProfile | null;
  avatarUrl = `https://i.pravatar.cc/320?img=${Math.floor(Math.random() * 70) + 1}`;
  measurements: { chest?: string; waist?: string; hips?: string; sleeve?: string; length?: string } = {};
  imageLibrary: string[] = [];
  newImageUrl = '';
  selectedImage: string | null = null;
  interests: string[] = [];
  newInterest = '';
  sewingAmountDue: number | null = null;
  backendError = '';
  sewingStatus: string | null = null;
  sewingStatusLoaded = false;
  processingDressName = '';
  processingDressComment = '';
  completedDressName = '';
  unstitchDresses: { dressName: string }[] = [];
  unstitchLoaded = false;
  statusSteps = ['about to process', 'processing', 'done'];

  constructor(private infoService: InfoService, private router: Router, private cdr: ChangeDetectorRef) {
    this.profile = null;
  }

  ngOnInit() {
    this.profile = this.infoService.loadStoredUser();
    if (!this.profile) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadMeasurements();
    this.loadImageLibrary();
    this.loadInterests();
    this.loadUserProfile();
    this.loadSewingStatus();
    this.loadProcessingDress();
    this.loadUnstitchDresses();
    this.loadCompletedDress();
  }

  logout() {
    this.infoService.logout();
    this.router.navigate(['/login']);
  }

  saveMeasurements() {
    try {
      localStorage.setItem('measurements', JSON.stringify(this.measurements || {}));
      alert('Measurements saved');
    } catch (e) {
      console.error(e);
    }
  }

  loadMeasurements() {
    const raw = localStorage.getItem('measurements');
    if (raw) {
      try { this.measurements = JSON.parse(raw); } catch { this.measurements = {}; }
    }
  }

  addImage() {
    const url = this.newImageUrl && this.newImageUrl.trim();
    if (!url) return;
    this.imageLibrary.unshift(url);
    this.newImageUrl = '';
    this.saveImageLibrary();
  }

  removeImage(i: number) {
    this.imageLibrary.splice(i, 1);
    this.saveImageLibrary();
  }

  selectImage(i: number) {
    this.selectedImage = this.imageLibrary[i] || null;
    localStorage.setItem('selectedImage', this.selectedImage || '');
  }

  closeSelectedImage() {
    this.selectedImage = null;
    localStorage.removeItem('selectedImage');
  }

  saveImageLibrary() {
    try { localStorage.setItem('imageLibrary', JSON.stringify(this.imageLibrary)); } catch (e) { console.error(e); }
  }

  loadImageLibrary() {
    const raw = localStorage.getItem('imageLibrary');
    if (raw) {
      try { this.imageLibrary = JSON.parse(raw); } catch { this.imageLibrary = []; }
    }
    if (!this.imageLibrary || this.imageLibrary.length === 0) {
      // seed with a few random avatars
      for (let i = 0; i < 6; i++) {
        this.imageLibrary.push(`https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70) + 1}`);
      }
    }
    const sel = localStorage.getItem('selectedImage');
    if (sel) this.selectedImage = sel || null;
  }

  // file upload handler: reads files as data URLs and prepends to imageLibrary
  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.imageLibrary.unshift(result);
        this.saveImageLibrary();
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  // interests persistence
  saveInterests() {
    try { localStorage.setItem('interests', JSON.stringify(this.interests)); } catch (e) { console.error(e); }
  }

  loadInterests() {
    const raw = localStorage.getItem('interests');
    if (raw) {
      try { this.interests = JSON.parse(raw); } catch { this.interests = []; }
    }
  }

  addInterest() {
    const v = this.newInterest && this.newInterest.trim();
    if (!v) return;
    this.interests.unshift(v);
    this.newInterest = '';
    this.saveInterests();
  }

  loadSewingStatus(retries = 1) {
    console.log('[Dashboard] loadSewingStatus start', { retries });
    this.backendError = '';
    this.sewingAmountDue = null;
    this.sewingStatus = null;
    this.sewingStatusLoaded = false;

    this.infoService.getSewingStatus().subscribe({
      next: (response) => {
        console.log('[Dashboard] sewing status response', response);
        this.sewingStatus = response.status ?? 'about to process';
        this.sewingAmountDue = response.amountDue ?? 0;
        this.sewingStatusLoaded = true;
        if (this.sewingStatus === 'done') {
          this.loadCompletedDress();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Dashboard] Failed to load sewing status', err);
        if (retries > 0) {
          setTimeout(() => this.loadSewingStatus(retries - 1), 1000);
        } else {
          this.backendError = 'Unable to load sewing status from backend.';
        }
      },
    });
  }

  loadUserProfile() {
    console.log('[Dashboard] loading backend user profile');
    this.infoService.getUserProfile().subscribe({
      next: (response) => {
        console.log('[Dashboard] backend profile response', response);
        if (response) {
          this.profile = response;
          try {
            localStorage.setItem('userProfile', JSON.stringify(response));
          } catch {
            // ignore local storage errors
          }
        }
      },
      error: (err) => {
        console.error('Failed to load backend user profile', err);
        this.backendError = 'Unable to load user profile from backend.';
      },
    });
  }

  loadProcessingDress() {
    this.infoService.getProcessingDress().subscribe({
      next: (response) => {
        this.processingDressName = response.dressName;
        this.processingDressComment = response.comment;
      },
      error: (err) => {
        console.error('Failed to load processing dress info', err);
      },
    });
  }

  loadUnstitchDresses() {
    this.unstitchLoaded = false;
    this.infoService.getUnstitchDresses().subscribe({
      next: (response) => {
        this.unstitchDresses = response.unstitchDresses || [];
        this.unstitchLoaded = true;
      },
      error: (err) => {
        console.error('Failed to load unstitch dress list', err);
        this.unstitchLoaded = true;
      },
    });
  }

  loadCompletedDress() {
    this.infoService.getCompletedDress().subscribe({
      next: (response) => {
        this.completedDressName = response.dressName || this.completedDressName;
      },
      error: (err) => {
        console.error('Failed to load completed dress info', err);
      },
    });
  }

  removeInterest(i: number) {
    this.interests.splice(i, 1);
    this.saveInterests();
  }
}
