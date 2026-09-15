import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Color } from '../../../core/models/color.model';
import { ColorsService } from '../../../core/services/colors.service';
import { ColorModalComponent } from '../components/color-modal/color-modal';

@Component({
  selector: 'app-colores-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ColorModalComponent],
  templateUrl: './colores-list.html',
})
export class ColoresListComponent implements OnInit {
  private readonly colorsService = inject(ColorsService);

  readonly colors = signal<Color[]>([]);
  readonly selectedColor = signal<Color | null>(null);
  readonly isModalOpen = signal<boolean>(false);

  readonly searchTerm = signal<string>('');
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadColors();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadColors();
    }, 400); // 400ms debounce
  }

  loadColors(): void {
    this.colorsService.getColors(this.searchTerm()).subscribe({
      next: (res) => {
        this.colors.set(res.colores.data);
      },
      error: (err: any) => console.error('Error cargando colores', err)
    });
  }

  openModal(color?: Color): void {
    if (color) {
      this.selectedColor.set(color);
    } else {
      this.selectedColor.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedColor.set(null);
  }

  deleteColor(id: string | number): void {
    // Si se desea eliminar lógicamente, usar endpoint de update is_active=false
    // o el endpoint delete si lo provee el backend.
    alert('Funcionalidad de eliminación dura no disponible. Recomendado desactivar.');
  }
}
