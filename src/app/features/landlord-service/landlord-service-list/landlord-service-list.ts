import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { LandlordServiceService } from '../../../core/services/landlord-service.service';
import { AreasService } from '../../../core/services/areas.service';
import { LandlordService } from '../../../core/models/landlord-service.model';
import { Landlord } from '../../../core/models/landlord.model';
import { Area } from '../../../core/models/area.model';
import { LandlordSearchModalComponent } from '../../../shared/components/landlord-search-modal/landlord-search-modal';

declare const bootstrap: any;

@Component({
  selector: 'app-landlord-service-list',
  standalone: true,
  imports: [ReactiveFormsModule, LandlordSearchModalComponent],
  templateUrl: './landlord-service-list.html',
})
export class LandlordServiceListComponent implements OnInit {
  @ViewChild(LandlordSearchModalComponent) landlordSearchModal!: LandlordSearchModalComponent;

  private readonly landlordServiceService = inject(LandlordServiceService);
  private readonly areasService = inject(AreasService);
  private readonly fb = inject(FormBuilder);

  services = signal<LandlordService[]>([]);
  filteredServices = signal<LandlordService[]>([]);
  areas = signal<Area[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  searchTerm = signal('');
  selectedLandlord = signal<Landlord | null>(null);

  readonly serviceForm = this.fb.nonNullable.group({
    landlord_id: ['', [Validators.required]],
    area_id: [null as number | null, [Validators.required]],
    service_description: ['', [Validators.required]],
    order_number: ['', [Validators.required]],
    siaf_file_number: ['', [Validators.required]],
    start_date: ['', [Validators.required]],
    end_date: ['', [Validators.required]],
    is_active: [true],
  }, { validators: this.dateRangeValidator });

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('start_date')?.value;
    const end = control.get('end_date')?.value;
    if (start && end && end < start) {
      return { dateRange: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadAreas();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.landlordServiceService.getAll().subscribe({
      next: (data) => {
        this.services.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar los servicios.');
        this.isLoading.set(false);
      },
    });
  }

  loadAreas(): void {
    this.areasService.getAll().subscribe({
      next: (data) => this.areas.set(data),
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredServices.set(this.services());
    } else {
      this.filteredServices.set(
        this.services().filter(
          (s) =>
            s.service_description.toLowerCase().includes(term) ||
            (s.order_number ?? '').toLowerCase().includes(term) ||
            (s.siaf_file_number ?? '').toLowerCase().includes(term) ||
            (s.landlord ? this.getLandlordName(s.landlord) : '').toLowerCase().includes(term)
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
    this.serviceForm.controls.landlord_id.setValue(landlord.id);
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.selectedLandlord.set(null);
    this.serviceForm.reset({
      landlord_id: '',
      area_id: null,
      service_description: '',
      order_number: '',
      siaf_file_number: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(service: LandlordService): void {
    this.isEditing.set(true);
    this.editingId.set(service.id);
    this.selectedLandlord.set(service.landlord ?? null);
    this.serviceForm.reset({
      landlord_id: service.landlord?.id ?? '',
      area_id: service.area?.id ?? null,
      service_description: service.service_description,
      order_number: service.order_number ?? '',
      siaf_file_number: service.siaf_file_number ?? '',
      start_date: service.start_date ? service.start_date.substring(0, 10) : '',
      end_date: service.end_date ? service.end_date.substring(0, 10) : '',
      is_active: service.is_active,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const { landlord_id, area_id, service_description, order_number, siaf_file_number, start_date, end_date, is_active } =
      this.serviceForm.getRawValue();

    if (this.isEditing()) {
      const dto = {
        area_id: area_id ?? undefined,
        service_description,
        order_number,
        siaf_file_number,
        start_date,
        end_date,
        is_active,
      };
      this.landlordServiceService.update(this.editingId()!, dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Servicio actualizado correctamente.');
          this.loadServices();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar el servicio.');
        },
      });
    } else {
      const dto = {
        landlord_id,
        area_id: area_id ?? undefined,
        service_description,
        order_number,
        siaf_file_number,
        start_date,
        end_date,
      };
      this.landlordServiceService.create(dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Servicio creado correctamente.');
          this.loadServices();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear el servicio.');
        },
      });
    }
  }

  getLandlordName(landlord: Landlord): string {
    return [landlord.first_name, landlord.last_name, landlord.last_name_mother]
      .filter(v => !!v)
      .join(' ') || landlord.document_number;
  }

  isFieldInvalid(field: 'landlord_id' | 'service_description' | 'order_number' | 'siaf_file_number' | 'area_id' | 'start_date' | 'end_date'): boolean {
    const control = this.serviceForm.controls[field];
    return control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('landlordServiceModal'));
  }
}
