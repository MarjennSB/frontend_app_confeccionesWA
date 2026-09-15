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
      this.loadInvoices();
    }, 400);
  }

  loadInvoices(): void {
    this.invoicesService.getInvoices(this.searchTerm()).subscribe({
      next: (res) => {
        this.invoices.set(res.invoices.data);
      },
      error: (err: any) => console.error('Error cargando facturas', err)
    });
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
    return `http://127.0.0.1:8000/storage/${filePath}`;
  }
}
