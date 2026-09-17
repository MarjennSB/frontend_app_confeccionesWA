import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PurchaseOrder } from '../../../core/models/purchase-order.model';
import { PurchaseOrdersService } from '../../../core/services/purchase-orders.service';
import { PurchaseOrderModalComponent } from '../components/purchase-order-modal/purchase-order-modal';

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PurchaseOrderModalComponent],
  templateUrl: './purchase-orders-list.html',
})
export class PurchaseOrdersListComponent implements OnInit {
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);

  readonly purchaseOrders = signal<PurchaseOrder[]>([]);
  readonly selectedPurchaseOrder = signal<PurchaseOrder | null>(null);
  readonly isModalOpen = signal<boolean>(false);

  readonly searchTerm = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalItems = signal<number>(0);
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadPurchaseOrders();
    }, 400); // 400ms debounce
  }

  loadPurchaseOrders(): void {
    this.purchaseOrdersService.getPurchaseOrders(this.searchTerm(), this.currentPage()).subscribe({
      next: (res) => {
        this.purchaseOrders.set(res.purchase_orders.data);
        if (res.pagination) {
          this.currentPage.set(res.pagination.current_page);
          this.totalPages.set(res.pagination.last_page);
          this.totalItems.set(res.pagination.total);
        }
      },
      error: (err: any) => console.error('Error cargando órdenes de compra', err)
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPurchaseOrders();
    }
  }

  openModal(purchaseOrder?: PurchaseOrder): void {
    if (purchaseOrder) {
      this.selectedPurchaseOrder.set(purchaseOrder);
    } else {
      this.selectedPurchaseOrder.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedPurchaseOrder.set(null);
  }

  deletePurchaseOrder(id: string | number): void {
    alert('Funcionalidad de eliminación dura no disponible. Recomendado desactivar.');
  }

  getDownloadUrl(filePath: string): string {
    // El resource ya devuelve la URL completa
    return filePath;
  }
}
