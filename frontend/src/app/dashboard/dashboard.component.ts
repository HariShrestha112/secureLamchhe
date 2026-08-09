import { Component } from '@angular/core';
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
export class DashboardComponent {
  profile: UserProfile | null;
  avatarUrl = `https://i.pravatar.cc/320?img=${Math.floor(Math.random() * 70) + 1}`;
  measurements: { chest?: string; waist?: string; hips?: string; sleeve?: string; length?: string } = {};
  imageLibrary: string[] = [];
  newImageUrl = '';
  selectedImage: string | null = null;
  interests: string[] = [];
  newInterest = '';

  constructor(private infoService: InfoService, private router: Router) {
    this.profile = this.infoService.loadStoredUser();
    if (!this.profile) {
      this.router.navigate(['/login']);
    }
    this.loadMeasurements();
    this.loadImageLibrary();
    this.loadInterests();
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

  removeInterest(i: number) {
    this.interests.splice(i, 1);
    this.saveInterests();
  }
}
