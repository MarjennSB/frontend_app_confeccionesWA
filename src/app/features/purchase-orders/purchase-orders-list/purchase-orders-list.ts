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
      this.loadPurchaseOrders();
    }, 400); // 400ms debounce
  }

  loadPurchaseOrders(): void {
    this.purchaseOrdersService.getPurchaseOrders(this.searchTerm()).subscribe({
      next: (res) => {
        this.purchaseOrders.set(res.purchase_orders.data);
      },
      error: (err: any) => console.error('Error cargando órdenes de compra', err)
    });
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
    // Assuming backend serves storage files publicly at /storage/
    return `http://127.0.0.1:8000/storage/${filePath}`;
  }
}
