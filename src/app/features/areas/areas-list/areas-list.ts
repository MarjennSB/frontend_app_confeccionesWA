import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AreasService } from '../../../core/services/areas.service';
import { Area } from '../../../core/models/area.model';

declare const bootstrap: any;

@Component({
  selector: 'app-areas-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './areas-list.html',
})
export class AreasListComponent implements OnInit {
  private readonly areasService = inject(AreasService);
  private readonly fb = inject(FormBuilder);

  areas = signal<Area[]>([]);
  filteredAreas = signal<Area[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  isEditing = signal(false);
  editingId = signal<number | null>(null);

  searchTerm = signal('');

  readonly areaForm = this.fb.nonNullable.group({
    acronym: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    area_father_id: [null as number | null],
    is_active: [true],
  });

  get parentAreas(): Area[] {
    return this.areas().filter((a) => a.id !== this.editingId());
  }

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.isLoading.set(true);
    this.areasService.getAll().subscribe({
      next: (data) => {
        this.areas.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar las áreas.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredAreas.set(this.areas());
    } else {
      this.filteredAreas.set(
        this.areas().filter(
          (a) =>
            a.name.toLowerCase().includes(term) ||
            a.acronym.toLowerCase().includes(term)
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
    this.areaForm.reset({ acronym: '', name: '', area_father_id: null, is_active: true });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(area: Area): void {
    this.isEditing.set(true);
    this.editingId.set(area.id);
    this.areaForm.reset({
      acronym: area.acronym,
      name: area.name,
      area_father_id: area.parent?.id ?? null,
      is_active: area.is_active,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  saveArea(): void {
    if (this.areaForm.invalid) {
      this.areaForm.markAllAsTouched();
      return;
    }

    const { acronym, name, area_father_id, is_active } = this.areaForm.getRawValue();

    if (this.isEditing()) {
      this.areasService.update(this.editingId()!, {
        acronym,
        name,
        area_father_id: area_father_id ?? null,
        is_active,
      }).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Área actualizada correctamente.');
          this.loadAreas();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar el área.');
        },
      });
    } else {
      this.areasService.create({
        acronym,
        name,
        area_father_id: area_father_id ?? undefined,
      }).subscribe({
        next: () => {
          this.getModal().hide();
          this.showSuccess('Área creada correctamente.');
          this.loadAreas();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear el área.');
        },
      });
    }
  }

  isFieldInvalid(field: 'acronym' | 'name'): boolean {
    const control = this.areaForm.controls[field];
    return control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('areaModal'));
  }
}
