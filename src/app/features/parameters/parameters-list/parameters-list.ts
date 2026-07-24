import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ParametersService } from '../../../core/services/parameters.service';
import { ResponsibleOfficerService } from '../../../core/services/responsible-officer.service';
import { Parameters } from '../../../core/models/parameters.model';
import { ResponsibleOfficer } from '../../../core/models/responsible-officer.model';

declare const bootstrap: any;

@Component({
  selector: 'app-parameters-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './parameters-list.html',
})
export class ParametersListComponent implements OnInit {
  private readonly parametersService = inject(ParametersService);
  private readonly officerService = inject(ResponsibleOfficerService);
  private readonly fb = inject(FormBuilder);

  parameters = signal<Parameters[]>([]);
  officers = signal<ResponsibleOfficer[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  isEditing = signal(false);
  editingId = signal<number | null>(null);

  readonly parametersForm = this.fb.nonNullable.group({
    organization_name: ['', [Validators.required, Validators.maxLength(300)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
    motto_of_the_year: ['', [Validators.required, Validators.maxLength(500)]],
    responsible_officer_id: [null as number | null],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadParameters();
    this.loadOfficers();
  }

  loadParameters(): void {
    this.isLoading.set(true);
    this.parametersService.getAll().subscribe({
      next: (data) => {
        this.parameters.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar los parámetros.');
        this.isLoading.set(false);
      },
    });
  }

  loadOfficers(): void {
    this.officerService.getAll().subscribe({
      next: (data) => this.officers.set(data.filter(o => o.is_active)),
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.parametersForm.reset({
      organization_name: '',
      year: new Date().getFullYear(),
      motto_of_the_year: '',
      responsible_officer_id: null,
      is_active: true,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(param: Parameters): void {
    this.isEditing.set(true);
    this.editingId.set(param.id);
    this.parametersForm.reset({
      organization_name: param.organization_name,
      year: param.year,
      motto_of_the_year: param.motto_of_the_year ?? '',
      responsible_officer_id: param.responsible_officer?.id ?? null,
      is_active: param.is_active,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  saveParameters(): void {
    if (this.parametersForm.invalid) {
      this.parametersForm.markAllAsTouched();
      return;
    }

    const { organization_name, year, motto_of_the_year, responsible_officer_id, is_active } =
      this.parametersForm.getRawValue();

    const dto = {
      organization_name,
      year,
      motto_of_the_year,
      responsible_officer_id: responsible_officer_id ?? null,
      is_active,
    };

    if (this.isEditing()) {
      this.parametersService.update(this.editingId()!, dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Parámetros actualizados correctamente.');
          this.loadParameters();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar los parámetros.');
        },
      });
    } else {
      this.parametersService.create(dto).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Parámetros creados correctamente.');
          this.loadParameters();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear los parámetros.');
        },
      });
    }
  }

  isFieldInvalid(field: 'organization_name' | 'year' | 'motto_of_the_year'): boolean {
    const control = this.parametersForm.controls[field];
    return control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('parametersModal'));
  }
}
