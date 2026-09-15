import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Invoice } from '../../../../core/models/invoice.model';
import { Production } from '../../../../core/models/production.model';
import { InvoicesService } from '../../../../core/services/invoices.service';
import { ProductionSelectorModalComponent } from '../production-selector-modal/production-selector-modal.component';

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductionSelectorModalComponent],
  templateUrl: './invoice-modal.html'
})
export class InvoiceModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly invoicesService = inject(InvoicesService);

  isOpen = input.required<boolean>();
  invoice = input<Invoice | null>(null);

  @Output() closeModal = new EventEmitter<void>();
  @Output() invoiceSaved = new EventEmitter<void>();

  readonly isEditMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly fileError = signal<string | null>(null);

  readonly isProdSelectorOpen = signal<boolean>(false);
  readonly selectedProdDisplay = signal<string>('');

  selectedFile: File | null = null;

  invoiceForm: FormGroup = this.fb.group({
    invoice_number: ['', Validators.required],
    production_id: ['', Validators.required],
    total_amount: [0, [Validators.required, Validators.min(0)]],
    currency: ['USD', Validators.required],
    issue_date: ['', Validators.required],
    due_date: [''],
    payment_status: ['PENDIENTE'],
    is_active: [true]
  });

  ngOnInit() {
    const currentInvoice = this.invoice();
    if (currentInvoice) {
      this.isEditMode.set(true);
      if (currentInvoice.production_id) {
        this.selectedProdDisplay.set(`OP vinculada ID: ${currentInvoice.production_id}`);
      }
      this.invoiceForm.patchValue({
        invoice_number: currentInvoice.invoice_number,
        production_id: currentInvoice.production_id,
        total_amount: currentInvoice.total_amount,
        currency: currentInvoice.currency,
        issue_date: currentInvoice.issue_date,
        due_date: currentInvoice.due_date,
        payment_status: currentInvoice.payment_status,
        is_active: currentInvoice.is_active,
      });
    } else {
      this.isEditMode.set(false);
      this.invoiceForm.reset({ 
        total_amount: 0, 
        currency: 'USD', 
        payment_status: 'PENDIENTE', 
        is_active: true 
      });
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileError.set(null);
    } else {
      this.selectedFile = null;
    }
  }

  openProdSelector(): void {
    this.isProdSelectorOpen.set(true);
  }

  onProdSelected(prod: Production): void {
    this.selectedProdDisplay.set(prod.production_order_number);
    this.invoiceForm.patchValue({ production_id: prod.id });
  }

  clearProdSelection(): void {
    this.selectedProdDisplay.set('');
    this.invoiceForm.patchValue({ production_id: null });
  }

  save() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }

    if (!this.isEditMode() && !this.selectedFile) {
      this.fileError.set('El archivo adjunto es obligatorio al registrar una factura.');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.invoiceForm.value;

    const data: any = {
      invoice_number: formValue.invoice_number,
      production_id: formValue.production_id,
      total_amount: formValue.total_amount,
      currency: formValue.currency,
      issue_date: formValue.issue_date,
      due_date: formValue.due_date,
      payment_status: formValue.payment_status,
      is_active: formValue.is_active
    };

    if (this.selectedFile) {
      data.attached_file = this.selectedFile;
    }

    if (this.isEditMode() && this.invoice()) {
      this.invoicesService.updateInvoice(this.invoice()!.id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.invoiceSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error actualizando factura', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.invoicesService.createInvoice(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.invoiceSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error creando factura', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }
}
