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
})
export class ProductionsListComponent implements OnInit {
  private readonly productionsService = inject(ProductionsService);

  readonly productions = signal<Production[]>([]);
  readonly selectedProduction = signal<Production | null>(null);
  readonly isModalOpen = signal<boolean>(false);
  
  readonly searchTerm = signal<string>('');
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
      this.loadProductions();
    }, 400); // 400ms debounce
  }

  loadProductions(): void {
    this.productionsService.getProductions(this.searchTerm()).subscribe({
      next: (res) => {
        this.productions.set(res.productions.data);
      },
      error: (err: any) => console.error('Error cargando producciones', err)
    });
  }

  openModal(production?: Production): void {
    if (production) {
      this.selectedProduction.set(production);
    } else {
      this.selectedProduction.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedProduction.set(null);
  }

  deleteProduction(id: string | number): void {
    alert('Funcionalidad de eliminación dura no disponible. Recomendado desactivar.');
  }
}
