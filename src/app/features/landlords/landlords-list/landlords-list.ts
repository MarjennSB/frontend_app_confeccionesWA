import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LandlordsService } from '../../../core/services/landlords.service';
import { TypeDocumentService } from '../../../core/services/type-document.service';
import { Landlord } from '../../../core/models/landlord.model';
import { TypeDocument } from '../../../core/models/type-document.model';

declare const bootstrap: any;

@Component({
  selector: 'app-landlords-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './landlords-list.html',
})
export class LandlordsListComponent implements OnInit {
  private readonly landlordsService = inject(LandlordsService);
  private readonly typeDocumentService = inject(TypeDocumentService);
  private readonly fb = inject(FormBuilder);

  landlords = signal<Landlord[]>([]);
  filteredLandlords = signal<Landlord[]>([]);
  typeDocuments = signal<TypeDocument[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  isEditing = signal(false);
  editingId = signal<string | null>(null);
  isRuc = signal(false);

  searchTerm = signal('');

  readonly landlordForm = this.fb.nonNullable.group({
    type_document_id: [null as number | null],
    document_number: ['', [Validators.required, Validators.maxLength(20)]],
    // Persona natural
    first_name: ['', [Validators.maxLength(200)]],
    last_name: ['', [Validators.maxLength(200)]],
    last_name_mother: ['', [Validators.maxLength(200)]],
    // RUC
    razon_social: ['', [Validators.maxLength(200)]],
    // Comunes
    email: ['', [Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.maxLength(20)]],
    address: [''],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadLandlords();
    this.loadTypeDocuments();

    this.landlordForm.controls.type_document_id.valueChanges.subscribe((id) => {
      const selected = this.typeDocuments().find(t => t.id === id);
      const ruc = selected?.acronym === 'RUC';
      this.isRuc.set(ruc);
      if (ruc) {
        this.landlordForm.controls.first_name.setValue('');
        this.landlordForm.controls.last_name.setValue('');
        this.landlordForm.controls.last_name_mother.setValue('');
      } else {
        this.landlordForm.controls.razon_social.setValue('');
      }
    });
  }

  loadLandlords(): void {
    this.isLoading.set(true);
    this.landlordsService.getAll().subscribe({
      next: (data) => {
        this.landlords.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar los locadores.');
        this.isLoading.set(false);
      },
    });
  }

  loadTypeDocuments(): void {
    this.typeDocumentService.getAll().subscribe({
      next: (data) => this.typeDocuments.set(data.filter(t => t.is_active)),
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredLandlords.set(this.landlords());
    } else {
      this.filteredLandlords.set(
        this.landlords().filter(
          (l) =>
            (l.first_name ?? '').toLowerCase().includes(term) ||
            (l.last_name ?? '').toLowerCase().includes(term) ||
            l.document_number.toLowerCase().includes(term) ||
            (l.email ?? '').toLowerCase().includes(term)
        )
      );
    }
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.isRuc.set(false);
    this.landlordForm.reset({
      type_document_id: null,
      document_number: '',
      first_name: '',
      last_name: '',
      last_name_mother: '',
      razon_social: '',
      email: '',
      phone: '',
      address: '',
      is_active: true,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(landlord: Landlord): void {
    this.isEditing.set(true);
    this.editingId.set(landlord.id);
    const ruc = landlord.type_document?.acronym === 'RUC';
    this.isRuc.set(ruc);
    this.landlordForm.reset({
      type_document_id: landlord.type_document?.id ?? null,
      document_number: landlord.document_number,
      first_name: landlord.first_name ?? '',
      last_name: landlord.last_name ?? '',
      last_name_mother: landlord.last_name_mother ?? '',
      razon_social: ruc ? (landlord.first_name ?? '') : '',
      email: landlord.email ?? '',
      phone: landlord.phone ?? '',
      address: landlord.address ?? '',
      is_active: landlord.is_active,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  saveLandlord(): void {
    if (this.landlordForm.invalid) {
      this.landlordForm.markAllAsTouched();
      return;
    }

    const { type_document_id, document_number, first_name, last_name, last_name_mother, razon_social, email, phone, address, is_active } =
      this.landlordForm.getRawValue();

    const dto = {
      type_document_id: type_document_id ?? null,
      document_number,
      first_name: this.isRuc() ? (razon_social || undefined) : (first_name || undefined),
      last_name: this.isRuc() ? undefined : (last_name || undefined),
      last_name_mother: this.isRuc() ? undefined : (last_name_mother || undefined),
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      is_active,
    };

    if (this.isEditing()) {
      this.landlordsService.update(this.editingId()!, dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Locador actualizado correctamente.');
          this.loadLandlords();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar el locador.');
        },
      });
    } else {
      this.landlordsService.create(dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Locador creado correctamente.');
          this.loadLandlords();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear el locador.');
        },
      });
    }
  }

  getLandlordDisplayName(landlord: Landlord): string {
    return [landlord.first_name, landlord.last_name, landlord.last_name_mother]
      .filter(v => !!v)
      .join(' ') || '—';
  }

  isFieldInvalid(field: 'document_number' | 'email' | 'razon_social'): boolean {
    const control = this.landlordForm.controls[field];
    return control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('landlordModal'));
  }
}
