import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ResponsibleOfficerService } from '../../../core/services/responsible-officer.service';
import { ResponsibleOfficer } from '../../../core/models/responsible-officer.model';

declare const bootstrap: any;

@Component({
  selector: 'app-responsible-officer-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './responsible-officer-list.html',
})
export class ResponsibleOfficerListComponent implements OnInit {
  private readonly officerService = inject(ResponsibleOfficerService);
  private readonly fb = inject(FormBuilder);

  officers = signal<ResponsibleOfficer[]>([]);
  filteredOfficers = signal<ResponsibleOfficer[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  isEditing = signal(false);
  editingId = signal<number | null>(null);

  searchTerm = signal('');

  readonly officerForm = this.fb.nonNullable.group({
    document_number: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    initials: ['', [Validators.required, Validators.maxLength(20)]],
    charge: ['', [Validators.maxLength(200)]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadOfficers();
  }

  loadOfficers(): void {
    this.isLoading.set(true);
    this.officerService.getAll().subscribe({
      next: (data) => {
        this.officers.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar los funcionarios.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredOfficers.set(this.officers());
    } else {
      this.filteredOfficers.set(
        this.officers().filter(
          (o) =>
            o.name.toLowerCase().includes(term) ||
            o.document_number.toLowerCase().includes(term) ||
            o.initials.toLowerCase().includes(term)
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
    this.officerForm.reset({ document_number: '', name: '', initials: '', charge: '', is_active: true });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(officer: ResponsibleOfficer): void {
    this.isEditing.set(true);
    this.editingId.set(officer.id);
    this.officerForm.reset({
      document_number: officer.document_number,
      name: officer.name,
      initials: officer.initials,
      charge: officer.charge ?? '',
      is_active: officer.is_active,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  saveOfficer(): void {
    if (this.officerForm.invalid) {
      this.officerForm.markAllAsTouched();
      return;
    }

    const { document_number, name, initials, charge, is_active } = this.officerForm.getRawValue();

    if (this.isEditing()) {
      this.officerService.update(this.editingId()!, { document_number, name, initials, charge, is_active }).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Funcionario actualizado correctamente.');
          this.loadOfficers();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar el funcionario.');
        },
      });
    } else {
      this.officerService.create({ document_number, name, initials, charge, is_active }).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Funcionario creado correctamente.');
          this.loadOfficers();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear el funcionario.');
        },
      });
    }
  }

  isFieldInvalid(field: 'document_number' | 'name' | 'initials' | 'charge'): boolean {
    const control = this.officerForm.controls[field];
    return control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('officerModal'));
  }
}
