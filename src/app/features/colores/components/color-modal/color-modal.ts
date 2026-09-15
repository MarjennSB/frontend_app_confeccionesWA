import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Color } from '../../../../core/models/color.model';
import { ColorsService } from '../../../../core/services/colors.service';

@Component({
  selector: 'app-color-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './color-modal.html'
})
export class ColorModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly colorsService = inject(ColorsService);

  isOpen = input.required<boolean>();
  color = input<Color | null>(null);
  zIndex = input<number>(1055);

  @Output() closeModal = new EventEmitter<void>();
  @Output() colorSaved = new EventEmitter<void>();

  readonly isEditMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  colorForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    abbreviation: ['', Validators.required],
    is_active: [true]
  });

  ngOnInit() {
    const currentColor = this.color();
    if (currentColor) {
      this.isEditMode.set(true);
      this.colorForm.patchValue({
        name: currentColor.name,
        abbreviation: currentColor.abbreviation,
        is_active: currentColor.is_active,
      });
    } else {
      this.isEditMode.set(false);
      this.colorForm.reset({ is_active: true });
    }
  }

  save() {
    if (this.colorForm.invalid) {
      this.colorForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    const formValue = this.colorForm.value;

    if (this.isEditMode() && this.color()) {
      this.colorsService.updateColor(this.color()!.id, formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.colorSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error actualizando color', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.colorsService.createColor(formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.colorSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error creando color', err);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }
}
