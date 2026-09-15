import { Component, EventEmitter, inject, input, Output, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorsService } from '../../../../core/services/colors.service';
import { Color } from '../../../../core/models/color.model';

@Component({
  selector: 'app-color-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" [class.show]="isOpen()" [style.display]="isOpen() ? 'block' : 'none'" tabindex="-1" style="z-index: 1060; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">Seleccionar Colores</h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex gap-2 mb-4">
              <div class="input-group flex-grow-1">
                <span class="input-group-text bg-white"><i class="ri-search-line"></i></span>
                <input type="text" class="form-control border-start-0" placeholder="Buscar color..." [ngModel]="searchTerm()" (ngModelChange)="onSearchChange($event)">
              </div>
              <button class="btn btn-outline-primary text-nowrap" title="Registrar nuevo Color" (click)="triggerCreateNew()">
                <i class="ri-add-line"></i> Nuevo Color
              </button>
            </div>
            
            <div class="border rounded p-3" style="max-height: 300px; overflow-y: auto; background: #f8f9fa;">
              <div class="row g-2">
                @for (color of colors(); track color.id) {
                  <div class="col-md-4 col-sm-6">
                    <div class="form-check custom-checkbox p-2 bg-white rounded border shadow-sm h-100 d-flex align-items-center">
                      <input class="form-check-input ms-1 me-2 cursor-pointer" type="checkbox" [id]="'selector_color_' + color.id"
                        [checked]="isColorSelected(color.id)" (change)="onColorChange($event, color.id)">
                      <label class="form-check-label w-100 cursor-pointer fw-medium" [for]="'selector_color_' + color.id">
                        {{ color.name }}
                      </label>
                    </div>
                  </div>
                } @empty {
                  <div class="col-12 text-center text-muted small py-3">No se encontraron colores.</div>
                }
              </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mt-4">
              <span class="text-muted small">Seleccionados: <strong>{{ tempSelectedColors().length }}</strong></span>
              <div>
                <button type="button" class="btn btn-light me-2" (click)="close()">Cancelar</button>
                <button type="button" class="btn btn-primary" (click)="confirmSelection()">Confirmar Selección</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ColorSelectorModalComponent implements OnInit {
  private readonly colorsService = inject(ColorsService);
  
  isOpen = input.required<boolean>();
  selectedColorIds = input<number[]>([]);
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() colorsSelected = new EventEmitter<number[]>();
  @Output() createNewColor = new EventEmitter<void>();

  colors = signal<Color[]>([]);
  searchTerm = signal<string>('');
  tempSelectedColors = signal<number[]>([]);
  private searchTimeout: any;

  constructor() {
    // Reactivo a cambios de isOpen: cuando se abre, sincroniza y carga
    effect(() => {
      if (this.isOpen()) {
        this.tempSelectedColors.set([...this.selectedColorIds()]);
        this.loadColors();
      }
    });
  }

  ngOnInit() {
    this.tempSelectedColors.set([...this.selectedColorIds()]);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadColors(), 400);
  }

  loadColors() {
    this.colorsService.getColors(this.searchTerm(), 100).subscribe({
      next: (res) => this.colors.set(res.colores.data),
      error: (err) => console.error('Error', err)
    });
  }

  // Acepta string | number para compatibilidad con el tipo del modelo Color
  isColorSelected(id: number | string): boolean {
    return this.tempSelectedColors().includes(Number(id));
  }

  onColorChange(event: any, colorId: number | string) {
    const id = Number(colorId);
    let current = [...this.tempSelectedColors()];
    
    if (event.target.checked) {
      if (!current.includes(id)) current.push(id);
    } else {
      current = current.filter(c => c !== id);
    }
    this.tempSelectedColors.set(current);
  }

  confirmSelection() {
    this.colorsSelected.emit(this.tempSelectedColors());
    this.close();
  }

  triggerCreateNew() {
    this.createNewColor.emit();
    this.close();
  }

  close() {
    this.searchTerm.set('');
    this.closeModal.emit();
  }
}
