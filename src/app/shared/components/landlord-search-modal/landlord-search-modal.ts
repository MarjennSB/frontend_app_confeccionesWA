import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { LandlordsService } from '../../../core/services/landlords.service';
import { Landlord } from '../../../core/models/landlord.model';

declare const bootstrap: any;

@Component({
  selector: 'app-landlord-search-modal',
  standalone: true,
  templateUrl: './landlord-search-modal.html',
})
export class LandlordSearchModalComponent implements OnInit {
  @Output() landlordSelected = new EventEmitter<Landlord>();

  private readonly landlordsService = inject(LandlordsService);

  landlords = signal<Landlord[]>([]);
  filteredLandlords = signal<Landlord[]>([]);
  searchTerm = signal('');

  ngOnInit(): void {
    this.landlordsService.getAll().subscribe({
      next: (data) => {
        const active = data.filter(l => l.is_active);
        this.landlords.set(active);
        this.filteredLandlords.set(active);
      },
    });
  }

  private parentModalEl: HTMLElement | null = null;

  open(parentModalId?: string): void {
    this.searchTerm.set('');
    this.filteredLandlords.set(this.landlords());

    // Ocultar el modal padre si se indica
    if (parentModalId) {
      this.parentModalEl = document.getElementById(parentModalId);
      if (this.parentModalEl) {
        bootstrap.Modal.getOrCreateInstance(this.parentModalEl).hide();
      }
    }

    // Esperar a que el modal padre termine de ocultarse antes de abrir este
    setTimeout(() => {
      bootstrap.Modal.getOrCreateInstance(document.getElementById('landlordSearchModal')).show();
    }, 300);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    const term = value.toLowerCase();
    if (!term) {
      this.filteredLandlords.set(this.landlords());
    } else {
      this.filteredLandlords.set(
        this.landlords().filter(
          (l) =>
            this.getLandlordName(l).toLowerCase().includes(term) ||
            l.document_number.toLowerCase().includes(term)
        )
      );
    }
  }

  selectLandlord(landlord: Landlord): void {
    this.landlordSelected.emit(landlord);
    this.closeAndReturn();
  }

  closeAndReturn(): void {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('landlordSearchModal')).hide();
    // Volver al modal padre si había uno
    if (this.parentModalEl) {
      setTimeout(() => {
        bootstrap.Modal.getOrCreateInstance(this.parentModalEl!).show();
        this.parentModalEl = null;
      }, 300);
    }
  }

  getLandlordName(landlord: Landlord): string {
    return [landlord.first_name, landlord.last_name, landlord.last_name_mother]
      .filter(v => !!v)
      .join(' ') || landlord.document_number;
  }
}
