import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Guide } from '../../../core/models/guide.model';
import { GuidesService } from '../../../core/services/guides.service';
import { GuideModalComponent } from '../components/guide-modal/guide-modal';

@Component({
  selector: 'app-guides-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GuideModalComponent],
  templateUrl: './guides-list.html',
})
export class GuidesListComponent implements OnInit {
  private readonly guidesService = inject(GuidesService);

  readonly guides = signal<Guide[]>([]);
  readonly selectedGuide = signal<Guide | null>(null);
  readonly isModalOpen = signal<boolean>(false);
  
  readonly searchTerm = signal<string>('');
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadGuides();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadGuides();
    }, 400);
  }

  loadGuides(): void {
    this.guidesService.getGuides(this.searchTerm()).subscribe({
      next: (res) => {
        this.guides.set(res.guides.data);
      },
      error: (err: any) => console.error('Error cargando guías', err)
    });
  }

  openModal(guide?: Guide): void {
    if (guide) {
      this.selectedGuide.set(guide);
    } else {
      this.selectedGuide.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedGuide.set(null);
  }

  deleteGuide(id: string | number): void {
    alert('Funcionalidad de eliminación dura no disponible. Recomendado desactivar.');
  }

  getDownloadUrl(filePath: string): string {
    return `http://127.0.0.1:8000/storage/${filePath}`;
  }
}
