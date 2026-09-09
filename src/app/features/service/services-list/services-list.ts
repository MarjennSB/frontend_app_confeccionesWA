import { Component, inject, OnInit, signal } from '@angular/core';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/models/service.model';
import { ServiceModalComponent } from '../components/service-modal/service-modal';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [ServiceModalComponent, FormsModule],
  templateUrl: './services-list.html',
})
export class ServicesListComponent implements OnInit {
  private readonly serviceService = inject(ServiceService);

  readonly services = signal<Service[]>([]);
  readonly isModalOpen = signal(false);
  readonly selectedService = signal<Service | null>(null);
  
  // Pagination and Search
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly searchQuery = signal('');
  private searchSubject = new Subject<string>();

  imageErrors: Record<string, boolean> = {};

  ngOnInit(): void {
    this.loadServices();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadServices();
    });
  }

  loadServices(): void {
    this.serviceService.getServices(this.currentPage(), 15, this.searchQuery()).subscribe({
      next: (res) => {
        this.services.set(res.servicios.data);
        this.totalPages.set(res.pagination.last_page);
      },
      error: (err) => console.error('Error cargando servicios', err)
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadServices();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadServices();
    }
  }

  openModal(service?: Service): void {
    this.selectedService.set(service || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedService.set(null);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }
}
