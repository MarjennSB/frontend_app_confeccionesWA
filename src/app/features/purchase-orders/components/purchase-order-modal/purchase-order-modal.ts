import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseOrder } from '../../../../core/models/purchase-order.model';
import { PurchaseOrdersService } from '../../../../core/services/purchase-orders.service';

@Component({
  selector: 'app-purchase-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-order-modal.html'
})
export class PurchaseOrderModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);

  isOpen = input.required<boolean>();
  purchaseOrder = input<PurchaseOrder | null>(null);
  zIndex = input<number>(1055);

  @Output() closeModal = new EventEmitter<void>();
  @Output() purchaseOrderSaved = new EventEmitter<void>();

  readonly isEditMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly serverError = signal<string | null>(null);
  
  selectedFile: File | null = null;

  poForm: FormGroup = this.fb.group({
    order_number: ['', Validators.required],
    unit_price: [0, [Validators.min(0)]],
    issue_date: [''],
    is_active: [true]
  });

  ngOnInit() {
    const currentPO = this.purchaseOrder();
    if (currentPO) {
      this.isEditMode.set(true);
      this.poForm.patchValue({
        order_number: currentPO.order_number,
        unit_price: Number(currentPO.unit_price).toFixed(2),
        issue_date: currentPO.issue_date ? currentPO.issue_date.substring(0, 10) : '',
        is_active: currentPO.is_active,
      });
    } else {
      this.isEditMode.set(false);
      this.poForm.reset({ unit_price: 0, is_active: true });
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  save() {
    this.serverError.set(null);
    
    if (this.poForm.invalid) {
      this.poForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    const formValue = this.poForm.value;

    const data: any = {
      order_number: formValue.order_number,
      unit_price: formValue.unit_price,
      issue_date: formValue.issue_date || null,
      is_active: formValue.is_active ? 1 : 0 // sometimes booleans in FormData need mapping
    };

    if (this.selectedFile) {
      data.attached_file = this.selectedFile;
    }

    if (this.isEditMode() && this.purchaseOrder()) {
      this.purchaseOrdersService.updatePurchaseOrder(this.purchaseOrder()!.id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.purchaseOrderSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error actualizando orden de compra', err);
          if (err.error && err.error.errors && err.error.errors.order_number) {
            this.serverError.set(err.error.errors.order_number[0]);
          } else if (err.error && err.error.mensaje) {
            this.serverError.set(err.error.mensaje);
          }
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.purchaseOrdersService.createPurchaseOrder(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.purchaseOrderSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error creando orden de compra', err);
          if (err.error && err.error.errors && err.error.errors.order_number) {
            this.serverError.set(err.error.errors.order_number[0]);
          } else if (err.error && err.error.mensaje) {
            this.serverError.set(err.error.mensaje);
          }
          this.isSubmitting.set(false);
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }
}
