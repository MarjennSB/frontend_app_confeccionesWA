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
  readonly searchDate = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalItems = signal<number>(0);
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
      this.currentPage.set(1);
      this.loadGuides();
    }, 400);
  }

  onSearchDateChange(date: string): void {
    this.searchDate.set(date);
    this.currentPage.set(1);
    this.loadGuides();
  }

  loadGuides(): void {
    this.guidesService.getGuides(this.searchTerm(), this.currentPage(), 10, undefined, this.searchDate()).subscribe({
      next: (res) => {
        this.guides.set(res.guides.data);
        if (res.pagination) {
          this.currentPage.set(res.pagination.current_page);
          this.totalPages.set(res.pagination.last_page);
          this.totalItems.set(res.pagination.total);
        }
      },
      error: (err: any) => console.error('Error cargando guías', err)
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadGuides();
    }
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
    // El resource ya devuelve la URL completa
    return filePath;
  }
}
