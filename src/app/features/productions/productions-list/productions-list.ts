import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Production } from '../../../core/models/production.model';
import { ProductionsService } from '../../../core/services/productions.service';
import { ProductionModalComponent } from '../components/production-modal/production-modal';

@Component({
  selector: 'app-productions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductionModalComponent],
  templateUrl: './productions-list.html',
  styleUrls: ['./productions-list.scss'],
})
export class ProductionsListComponent implements OnInit {
  private readonly productionsService = inject(ProductionsService);

  readonly productions = signal<Production[]>([]);
  readonly selectedProduction = signal<Production | null>(null);
  readonly isModalOpen = signal<boolean>(false);

  readonly searchTerm = signal<string>('');
  readonly filterDate = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalItems = signal<number>(0);

  // Modales de detalle de colores y guías
  readonly detailModalType = signal<'colors' | 'guides' | null>(null);
  readonly detailModalProduction = signal<Production | null>(null);

  private searchTimeout: any;

  ngOnInit(): void {
    this.loadProductions();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProductions();
    }, 400);
  }

  onDateChange(date: string): void {
    this.filterDate.set(date);
    this.currentPage.set(1);
    this.loadProductions();
  }

  loadProductions(): void {
    // If they want ALL productions for printing when date is set, we could pass per_page=1000, 
    // but the API is paginated. For now we use the default or a large number for printing?
    // Wait, let's keep the standard pagination. If they want to print, they print what's on screen,
    // or we fetch all. Let's pass a large perPage if we want to print everything for that day.
    // The user said "el filtro por fecha ya que esto normalmente las hago los martes".
    // I'll leave perPage default for the view, but let's change getProductions to allow overriding perPage if needed later.
    this.productionsService.getProductions(this.searchTerm(), this.currentPage(), 10, this.filterDate()).subscribe({
      next: (res) => {
        this.productions.set(res.productions.data);
        if (res.pagination) {
          this.currentPage.set(res.pagination.current_page);
          this.totalPages.set(res.pagination.last_page);
          this.totalItems.set(res.pagination.total);
        }
      },
      error: (err: any) => console.error('Error cargando producciones', err)
    });
  }

  printReport(): void {
    window.print();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProductions();
    }
  }

  openModal(production?: Production): void {
    this.selectedProduction.set(production || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedProduction.set(null);
  }

  deleteProduction(id: string | number): void {
    alert('Funcionalidad de eliminación dura no disponible. Recomendado desactivar.');
  }

  openDetailModal(prod: Production, type: 'colors' | 'guides'): void {
    this.detailModalProduction.set(prod);
    this.detailModalType.set(type);
  }

  closeDetailModal(): void {
    this.detailModalType.set(null);
    this.detailModalProduction.set(null);
  }
}
