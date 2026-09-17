import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrdersService } from '../../../../core/services/purchase-orders.service';
import { PurchaseOrder } from '../../../../core/models/purchase-order.model';

@Component({
  selector: 'app-po-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" [class.show]="isOpen()" [style.display]="isOpen() ? 'block' : 'none'" tabindex="-1" style="z-index: 1060; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">Seleccionar Orden de Compra</h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex gap-2 mb-4">
              <div class="input-group flex-grow-1">
                <span class="input-group-text bg-white"><i class="ri-search-line"></i></span>
                <input type="text" class="form-control border-start-0" placeholder="Buscar por número..." [ngModel]="searchTerm()" (ngModelChange)="onSearchChange($event)">
              </div>
              <button class="btn btn-outline-primary text-nowrap" title="Registrar nueva Orden de Compra" (click)="triggerCreateNew()">
                <i class="ri-add-line"></i> Registrar
              </button>
            </div>
            
            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
              <table class="table table-hover align-middle">
                <thead class="table-light sticky-top">
                  <tr>
                    <th>Nro. Orden</th>
                    <th>Precio Unit.</th>
                    <th>Fecha</th>
                    <th class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (po of purchaseOrders(); track po.id) {
                    <tr>
                      <td class="fw-medium text-primary">{{ po.order_number }}</td>
                      <td>$ {{ po.unit_price | number:'1.2-2' }}</td>
                      <td>{{ po.issue_date ? (po.issue_date | date:'dd/MM/yyyy') : 'N/A' }}</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-primary" (click)="selectPo(po)">Seleccionar</button>
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
export class PoSelectorModalComponent {
  private readonly poService = inject(PurchaseOrdersService);
  
  isOpen = input.required<boolean>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() poSelected = new EventEmitter<PurchaseOrder>();
  @Output() createNewPo = new EventEmitter<void>();

  purchaseOrders = signal<PurchaseOrder[]>([]);
  searchTerm = signal<string>('');
  private searchTimeout: any;

  ngOnChanges() {
    if (this.isOpen()) {
      this.loadPOs();
    }
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadPOs(), 400);
  }

  loadPOs() {
    // Pedir página 1, 10 registros
    this.poService.getPurchaseOrders(this.searchTerm(), 1, 10).subscribe({
      next: (res) => this.purchaseOrders.set(res.purchase_orders.data),
      error: (err) => console.error('Error', err)
    });
  }

  selectPo(po: PurchaseOrder) {
    this.poSelected.emit(po);
    this.close();
  }

  triggerCreateNew() {
    this.createNewPo.emit();
    this.close();
  }

  close() {
    this.searchTerm.set('');
    this.closeModal.emit();
  }
}
