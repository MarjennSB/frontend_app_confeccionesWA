import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestCertificatesService } from '../../../core/services/request-certificates.service';
import { StatusService } from '../../../core/services/status.service';
import { RequestCertificate } from '../../../core/models/request-certificate.model';
import { Status } from '../../../core/models/status.model';
import { Landlord } from '../../../core/models/landlord.model';
import { LandlordSearchModalComponent } from '../../../shared/components/landlord-search-modal/landlord-search-modal';

declare const bootstrap: any;

@Component({
  selector: 'app-request-certificates-list',
  standalone: true,
  imports: [ReactiveFormsModule, LandlordSearchModalComponent],
  templateUrl: './request-certificates-list.html',
})
export class RequestCertificatesListComponent implements OnInit {
  @ViewChild(LandlordSearchModalComponent) landlordSearchModal!: LandlordSearchModalComponent;

  private readonly requestCertificatesService = inject(RequestCertificatesService);
  private readonly statusService = inject(StatusService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  requests = signal<RequestCertificate[]>([]);
  filteredRequests = signal<RequestCertificate[]>([]);
  statuses = signal<Status[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  searchTerm = signal('');
  selectedLandlord = signal<Landlord | null>(null);

  readonly requestForm = this.fb.nonNullable.group({
    landlord_id: ['', [Validators.required]],
    file_number: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    file_date: ['', [Validators.required]],
    reason_request: ['', [Validators.required]],
    status_id: [null as number | null, [Validators.required]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadRequests();
    this.loadStatuses();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.requestCertificatesService.getAll().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar las solicitudes.');
        this.isLoading.set(false);
      },
    });
  }

  loadStatuses(): void {
    this.statusService.getAll().subscribe({
      next: (data) => this.statuses.set(data),
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredRequests.set(this.requests());
    } else {
      this.filteredRequests.set(
        this.requests().filter(
          (r) =>
            (r.file_number ?? '').toLowerCase().includes(term) ||
            (r.reason_request ?? '').toLowerCase().includes(term) ||
            (r.status?.name ?? '').toLowerCase().includes(term) ||
            (r.landlord ? this.getLandlordName(r.landlord) : '').toLowerCase().includes(term)
        )
      );
    }
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  onLandlordSelected(landlord: Landlord): void {
    this.selectedLandlord.set(landlord);
    this.requestForm.controls.landlord_id.setValue(landlord.id);
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.selectedLandlord.set(null);
    this.requestForm.reset({
      landlord_id: '',
      file_number: '',
      file_date: '',
      reason_request: '',
      status_id: null,
      is_active: true,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(request: RequestCertificate): void {
    this.isEditing.set(true);
    this.editingId.set(request.id);
    this.selectedLandlord.set(request.landlord ?? null);
    this.requestForm.reset({
      landlord_id: request.landlord?.id ?? '',
      file_number: request.file_number ?? '',
      file_date: request.file_date ? request.file_date.substring(0, 10) : '',
      reason_request: request.reason_request ?? '',
      status_id: request.status?.id ?? null,
      is_active: request.is_active,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  saveRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const { landlord_id, file_number, file_date, reason_request, status_id, is_active } =
      this.requestForm.getRawValue();

    if (this.isEditing()) {
      const dto = {
        file_number,
        file_date,
        reason_request,
        status_id: status_id!,
        is_active,
      };
      this.requestCertificatesService.update(this.editingId()!, dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Solicitud actualizada correctamente.');
          this.loadRequests();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar la solicitud.');
        },
      });
    } else {
      const dto = {
        landlord_id,
        file_number,
        file_date,
        reason_request,
        status_id: status_id!,
      };
      this.requestCertificatesService.create(dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Solicitud creada correctamente.');
          this.loadRequests();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear la solicitud.');
        },
      });
    }
  }

  goToGenerate(requestId: string): void {
    this.router.navigate(['/certificates/generate', requestId]);
  }

  getLandlordName(landlord: Landlord): string {
    return [landlord.first_name, landlord.last_name, landlord.last_name_mother]
      .filter(v => !!v)
      .join(' ') || landlord.document_number;
  }

  isFieldInvalid(field: 'landlord_id' | 'file_number' | 'file_date' | 'reason_request' | 'status_id'): boolean {
    const control = this.requestForm.controls[field];
    return control.invalid && control.touched;
  }

  getStatusBadgeClass(status?: Status): string {
    if (!status) return 'bg-secondary-subtle text-secondary';
    const name = status.name.toLowerCase();
    if (name.includes('pendiente')) return 'bg-warning-subtle text-warning';
    if (name.includes('aprobad') || name.includes('completad')) return 'bg-success-subtle text-success';
    if (name.includes('rechazad') || name.includes('cancel')) return 'bg-danger-subtle text-danger';
    if (name.includes('proceso') || name.includes('revision')) return 'bg-info-subtle text-info';
    return 'bg-secondary-subtle text-secondary';
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('requestCertificateModal'));
  }
}
