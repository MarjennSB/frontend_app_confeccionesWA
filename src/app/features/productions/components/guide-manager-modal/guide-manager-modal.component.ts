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
            <h5 class="modal-title fw-bold">Guías de Remisión (Máx. 10)</h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body p-3">

            <!-- Pestañas -->
            <ul class="nav nav-tabs mb-3">
              <li class="nav-item">
                <button class="nav-link" [class.active]="activeTab() === 'selected'" (click)="activeTab.set('selected')">
                  <i class="ri-check-line me-1"></i>Asignadas <span class="badge bg-primary ms-1">{{ tempSelectedGuides().length }}</span>
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" [class.active]="activeTab() === 'available'" (click)="loadAvailable(); activeTab.set('available')">
                  <i class="ri-search-line me-1"></i>Disponibles <span class="badge bg-secondary ms-1">{{ availableGuides().length }}</span>
                </button>
              </li>
            </ul>

            <!-- Pestaña: Asignadas -->
            @if (activeTab() === 'selected') {
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">Registradas: <strong>{{ tempSelectedGuides().length }} / 10</strong></span>
                <button class="btn btn-outline-primary btn-sm" (click)="triggerCreateNew()" [disabled]="tempSelectedGuides().length >= 10">
                  <i class="ri-add-line"></i> Registrar nueva guía
                </button>
              </div>
              <div class="border rounded" style="max-height: 300px; overflow-y: auto; background: #f8f9fa;">
                @if (displayGuides().length > 0) {
                  <ul class="list-group list-group-flush">
                    @for (guide of displayGuides(); track guide.id) {
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent py-2">
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
                    No hay guías asignadas. Ve a la pestaña <strong>Disponibles</strong> para seleccionar.
                  </div>
                }
              </div>
            }

            <!-- Pestaña: Disponibles (no asignadas a ninguna producción) -->
            @if (activeTab() === 'available') {
              @if (loadingAvailable()) {
                <div class="text-center py-4 text-muted small"><span class="spinner-border spinner-border-sm me-1"></span> Cargando guías...</div>
              } @else if (availableGuides().length === 0) {
                <div class="p-4 text-center text-muted small">
                  No hay guías disponibles sin asignar. Registra una nueva desde la pestaña <strong>Asignadas</strong>.
                </div>
              } @else {
                <p class="text-muted small mb-2">Selecciona las guías para añadirlas a esta producción:</p>
                <div class="border rounded" style="max-height: 300px; overflow-y: auto; background: #f8f9fa;">
                  <ul class="list-group list-group-flush">
                    @for (guide of availableGuides(); track guide.id) {
                      <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent py-2"
                          [class.list-group-item-primary]="isGuideSelected(guide.id)">
                        <div>
                          <div class="fw-medium"><i class="ri-file-text-line me-1 text-secondary"></i> {{ guide.guide_number }}</div>
                          <div class="small text-muted">{{ guide.issue_date ? (guide.issue_date | date:'dd/MM/yyyy') : 'Sin fecha' }}</div>
                        </div>
                        @if (isGuideSelected(guide.id)) {
                          <button class="btn btn-sm btn-success" disabled>
                            <i class="ri-check-line"></i> Añadida
                          </button>
                        } @else {
                          <button class="btn btn-sm btn-outline-primary"
                            [disabled]="tempSelectedGuides().length >= 10"
                            (click)="addGuide(guide.id)">
                            <i class="ri-add-line"></i> Añadir
                          </button>
                        }
                      </li>
                    }
                  </ul>
                </div>
              }
            }

          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-light me-2" (click)="close()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="confirmSelection()">Confirmar Selección</button>
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
  availableGuides = signal<Guide[]>([]);
  loadingAvailable = signal<boolean>(false);
  activeTab = signal<'selected' | 'available'>('selected');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.tempSelectedGuides.set([...this.selectedGuideIds()]);
        this.activeTab.set('selected');
        this.loadGuides();
      }
    });
  }

  ngOnInit() {
    this.tempSelectedGuides.set([...this.selectedGuideIds()]);
  }

  loadGuides() {
    this.guidesService.getGuides('', 1, 200).subscribe({
      next: (res) => {
        this.allGuides.set(res.guides.data);
        this.updateDisplayGuides();
      },
      error: (err) => console.error('Error cargando guías', err)
    });
  }

  loadAvailable() {
    this.loadingAvailable.set(true);
    this.guidesService.getGuides('', 1, 200, true).subscribe({
      next: (res) => {
        this.availableGuides.set(res.guides.data);
        this.loadingAvailable.set(false);
      },
      error: (err) => {
        console.error('Error cargando guías disponibles', err);
        this.loadingAvailable.set(false);
      }
    });
  }

  reloadAndSync(newlyCreatedIds?: number[]) {
    this.guidesService.getGuides('', 1, 200).subscribe({
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

  isGuideSelected(guideId: number | string): boolean {
    return this.tempSelectedGuides().includes(Number(guideId));
  }

  addGuide(guideId: number | string) {
    const id = Number(guideId);
    if (this.tempSelectedGuides().length >= 10) return;
    if (!this.isGuideSelected(id)) {
      this.tempSelectedGuides.set([...this.tempSelectedGuides(), id]);
      this.updateDisplayGuides();
    }
  }

  removeGuide(guideId: number | string) {
    const id = Number(guideId);
    this.tempSelectedGuides.set(this.tempSelectedGuides().filter(g => g !== id));
    this.updateDisplayGuides();
  }

  confirmSelection() {
    this.guidesSelected.emit(this.tempSelectedGuides());
    this.close();
  }

  triggerCreateNew() {
    if (this.tempSelectedGuides().length >= 10) return;
    this.createNewGuide.emit();
  }

  close() {
    this.closeModal.emit();
  }
}
