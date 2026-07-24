import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AreasService } from '../../../core/services/areas.service';
import { Area, UpdateAreaDto } from '../../../core/models/area.model';

interface AreaForm {
  acronym: string;
  name: string;
  area_father_id?: number;
  is_active: boolean;
}

declare const bootstrap: any;

@Component({
  selector: 'app-areas-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './areas-list.html',
})
export class AreasListComponent implements OnInit {
  private readonly areasService = inject(AreasService);

  areas = signal<Area[]>([]);
  filteredAreas = signal<Area[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  // Formulario crear/editar
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  form = signal<AreaForm>({ acronym: '', name: '', area_father_id: undefined, is_active: true });

  // Búsqueda
  searchTerm = signal('');


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
    this.form.set({ acronym: '', name: '', area_father_id: undefined, is_active: true });
    this.errorMsg.set(null);
    this.getCreateModal().show();
  }

  openEditModal(area: Area): void {
    this.isEditing.set(true);
    this.editingId.set(area.id);
    this.form.set({
      acronym: area.acronym,
      name: area.name,
      area_father_id: area.parent?.id,
      is_active: area.is_active,
    });
    this.errorMsg.set(null);
    this.getCreateModal().show();
  }

  onFormAcronymChange(value: string): void {
    this.form.update((f) => ({ ...f, acronym: value }));
  }

  onFormNameChange(value: string): void {
    this.form.update((f) => ({ ...f, name: value }));
  }

  onFormParentChange(value: string): void {
    const id = value ? +value : undefined;
    this.form.update((f) => ({ ...f, area_father_id: id }));
  }

  onFormStatusChange(value: string): void {
    this.form.update((f) => ({ ...f, is_active: value === 'true' }));
  }

  saveArea(): void {
    const f = this.form();
    if (!f.acronym.trim() || !f.name.trim()) {
      this.errorMsg.set('La sigla y el nombre son obligatorios.');
      return;
    }

    if (this.isEditing()) {
      const dto: UpdateAreaDto = {
        acronym: f.acronym,
        name: f.name,
        area_father_id: f.area_father_id ?? null,
        is_active: f.is_active,
      };
      this.areasService.update(this.editingId()!, dto).subscribe({
        next: () => {
          this.getCreateModal().hide();
          this.showSuccess('Área actualizada correctamente.');
          this.loadAreas();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar el área.');
        },
      });
    } else {
      this.areasService.create(f).subscribe({
        next: () => {
          this.getCreateModal().hide();
          this.showSuccess('Área creada correctamente.');
          this.loadAreas();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear el área.');
        },
      });
    }
  }

  get parentAreas(): Area[] {
    return this.areas().filter((a) => a.id !== this.editingId());
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getCreateModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('areaModal'));
  }
}
