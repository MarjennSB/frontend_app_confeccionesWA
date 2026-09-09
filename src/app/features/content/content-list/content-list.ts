import { Component, inject, OnInit, signal } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { Content } from '../../../core/models/content.model';
import { ContentModalComponent } from '../components/content-modal/content-modal';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [ContentModalComponent, FormsModule, DatePipe],
  templateUrl: './content-list.html',
})
export class ContentListComponent implements OnInit {
  private readonly contentService = inject(ContentService);

  readonly contents = signal<Content[]>([]);
  readonly isModalOpen = signal(false);
  readonly selectedContent = signal<Content | null>(null);
  
  // Pagination and Search
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly searchQuery = signal('');
  private searchSubject = new Subject<string>();

  imageErrors: Record<string, boolean> = {};

  ngOnInit(): void {
    this.loadContents();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadContents();
    });
  }

  loadContents(): void {
    this.contentService.getContents(this.currentPage(), 15, this.searchQuery()).subscribe({
      next: (res) => {
        this.contents.set(res.contenidos.data);
        this.totalPages.set(res.pagination.last_page);
      },
      error: (err) => console.error('Error cargando contenidos', err)
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadContents();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadContents();
    }
  }

  openModal(content?: Content): void {
    this.selectedContent.set(content || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedContent.set(null);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }
}
