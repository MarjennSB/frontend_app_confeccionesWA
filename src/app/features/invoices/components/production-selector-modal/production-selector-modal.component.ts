import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionsService } from '../../../../core/services/productions.service';
import { Production } from '../../../../core/models/production.model';

@Component({
  selector: 'app-production-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" [class.show]="isOpen()" [style.display]="isOpen() ? 'block' : 'none'" tabindex="-1" style="z-index: 1060; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">Seleccionar Orden de Producción</h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="input-group mb-4">
              <span class="input-group-text bg-white"><i class="ri-search-line"></i></span>
              <input type="text" class="form-control border-start-0" placeholder="Buscar por Nro. O/C..." [ngModel]="searchTerm()" (ngModelChange)="onSearchChange($event)">
            </div>
            
            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
              <table class="table table-hover align-middle">
                <thead class="table-light sticky-top">
                  <tr>
                    <th>Nro. O/C</th>
                    <th>Nro. O/P</th>
                    <th>Cantidad</th>
                    <th class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (prod of productions(); track prod.id) {
                    <tr>
                      <td class="fw-medium text-primary">{{ prod.purchase_order_number }}</td>
                      <td>{{ prod.production_order_number }}</td>
                      <td>{{ prod.quantity }}</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-primary" (click)="selectProduction(prod)">Seleccionar</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="text-center py-3 text-muted">No se encontraron resultados.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductionSelectorModalComponent {
  private readonly prodService = inject(ProductionsService);

  isOpen = input.required<boolean>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() productionSelected = new EventEmitter<Production>();

  productions = signal<Production[]>([]);
  searchTerm = signal<string>('');
  private searchTimeout: any;

  ngOnChanges() {
    if (this.isOpen()) {
      this.loadProductions();
    }
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadProductions(), 400);
  }

  loadProductions() {
    this.prodService.getProductions(this.searchTerm(), 1, 10).subscribe({
      next: (res) => this.productions.set(res.productions.data),
      error: (err) => console.error('Error', err)
    });
  }

  selectProduction(prod: Production) {
    this.productionSelected.emit(prod);
    this.close();
  }

  close() {
    this.searchTerm.set('');
    this.closeModal.emit();
  }
}
