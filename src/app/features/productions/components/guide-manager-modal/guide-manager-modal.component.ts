import { Component, EventEmitter, inject, input, Output, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuidesService } from '../../../../core/services/guides.service';
import { Guide } from '../../../../core/models/guide.model';

@Component({
  selector: 'app-guide-manager-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade" [class.show]="isOpen()" [style.display]="isOpen() ? 'block' : 'none'" tabindex="-1" style="z-index: 1060; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">Guías de Remisión (Máx. 9)</h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body p-4">
            
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-muted small">Registradas: <strong>{{ tempSelectedGuides().length }} / 9</strong></span>
              <button class="btn btn-outline-primary btn-sm" (click)="triggerCreateNew()" [disabled]="tempSelectedGuides().length >= 9">
                <i class="ri-add-line"></i> Registrar Guía
              </button>
            </div>
            
            <div class="border rounded p-0 overflow-hidden" style="max-height: 250px; overflow-y: auto; background: #f8f9fa;">
              @if (displayGuides().length > 0) {
                <ul class="list-group list-group-flush">
                  @for (guide of displayGuides(); track guide.id) {
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3">
                      <div>
                        <div class="fw-medium text-primary"><i class="ri-file-text-line me-1"></i> {{ guide.guide_number }}</div>
                        <div class="small text-muted">{{ guide.issue_date ? (guide.issue_date | date:'dd/MM/yyyy') : 'Sin fecha' }}</div>
                      </div>
                      <button class="btn btn-sm btn-outline-danger" title="Quitar" (click)="removeGuide(guide.id)">
                        <i class="ri-delete-bin-line"></i>
                      </button>
                    </li>
                  }
                </ul>
              } @else {
                <div class="p-4 text-center text-muted small">
                  No hay guías registradas para esta producción.
                </div>
              }
            </div>
            
            <div class="d-flex justify-content-end mt-4">
              <button type="button" class="btn btn-light me-2" (click)="close()">Cancelar</button>
              <button type="button" class="btn btn-primary" (click)="confirmSelection()">Confirmar Selección</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GuideManagerModalComponent implements OnInit {
  private readonly guidesService = inject(GuidesService);
  
  isOpen = input.required<boolean>();
  selectedGuideIds = input<number[]>([]);
  
  @Output() closeModal = new EventEmitter<number[]>();
  @Output() guidesSelected = new EventEmitter<number[]>();
  @Output() createNewGuide = new EventEmitter<void>();

  allGuides = signal<Guide[]>([]);
  displayGuides = signal<Guide[]>([]);
  tempSelectedGuides = signal<number[]>([]);

  constructor() {
    // Reactivo a cambios en isOpen: cuando se abre, sincroniza la selección y carga guías
    effect(() => {
      if (this.isOpen()) {
        this.tempSelectedGuides.set([...this.selectedGuideIds()]);
        this.loadGuides();
      }
    });
  }

  ngOnInit() {
    this.tempSelectedGuides.set([...this.selectedGuideIds()]);
  }

  loadGuides() {
    this.guidesService.getGuides('', 200).subscribe({
      next: (res) => {
        this.allGuides.set(res.guides.data);
        this.updateDisplayGuides();
      },
      error: (err) => console.error('Error cargando guías', err)
    });
  }

  reloadAndSync(newlyCreatedIds?: number[]) {
    this.guidesService.getGuides('', 200).subscribe({
      next: (res) => {
        this.allGuides.set(res.guides.data);
        if (newlyCreatedIds) {
          const current = [...this.tempSelectedGuides(), ...newlyCreatedIds];
          this.tempSelectedGuides.set([...new Set(current)]);
        }
        this.updateDisplayGuides();
      },
      error: (err) => console.error('Error cargando guías', err)
    });
  }

  updateDisplayGuides() {
    const selected = this.tempSelectedGuides();
    const all = this.allGuides();
    this.displayGuides.set(all.filter(g => selected.includes(Number(g.id))));
  }

  removeGuide(guideId: number | string) {
    const id = Number(guideId);
    let current = [...this.tempSelectedGuides()];
    current = current.filter(g => g !== id);
    this.tempSelectedGuides.set(current);
    this.updateDisplayGuides();
  }

  confirmSelection() {
    this.guidesSelected.emit(this.tempSelectedGuides());
    this.close();
  }

  triggerCreateNew() {
    if (this.tempSelectedGuides().length >= 9) return;
    this.createNewGuide.emit();
  }

  close() {
    this.closeModal.emit();
  }
}
