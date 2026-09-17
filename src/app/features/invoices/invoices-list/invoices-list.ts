import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Invoice } from '../../../core/models/invoice.model';
import { InvoicesService } from '../../../core/services/invoices.service';
import { InvoiceModalComponent } from '../components/invoice-modal/invoice-modal';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InvoiceModalComponent],
  templateUrl: './invoices-list.html',
})
export class InvoicesListComponent implements OnInit {
  private readonly invoicesService = inject(InvoicesService);

  readonly invoices = signal<Invoice[]>([]);
  readonly selectedInvoice = signal<Invoice | null>(null);
  readonly isModalOpen = signal<boolean>(false);
  
  readonly searchTerm = signal<string>('');
  readonly filterDate = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly totalItems = signal<number>(0);
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadInvoices();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadInvoices();
    }, 400);
  }

  onDateChange(dateStr: string): void {
    this.filterDate.set(dateStr);
    this.currentPage.set(1);
    this.loadInvoices();
  }

  printReport(): void {
    window.print();
  }

  loadInvoices(): void {
    this.invoicesService.getInvoices(this.searchTerm(), this.filterDate(), this.currentPage()).subscribe({
      next: (res) => {
        this.invoices.set(res.invoices.data);
        if (res.pagination) {
          this.currentPage.set(res.pagination.current_page);
          this.totalPages.set(res.pagination.last_page);
          this.totalItems.set(res.pagination.total);
        }
      },
      error: (err: any) => console.error('Error cargando facturas', err)
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadInvoices();
    }
  }

  openModal(invoice?: Invoice): void {
    if (invoice) {
      this.selectedInvoice.set(invoice);
    } else {
      this.selectedInvoice.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedInvoice.set(null);
  }

  deleteInvoice(id: string | number): void {
    alert('Funcionalidad de eliminación dura no disponible. Recomendado anular la factura editándola.');
  }

  getDownloadUrl(filePath: string): string {
    // El resource ya devuelve la URL completa
    return filePath;
  }
}
