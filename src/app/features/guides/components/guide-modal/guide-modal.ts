import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Guide } from '../../../../core/models/guide.model';
import { GuidesService } from '../../../../core/services/guides.service';

@Component({
  selector: 'app-guide-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guide-modal.html'
})
export class GuideModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly guidesService = inject(GuidesService);

  isOpen = input.required<boolean>();
  guide = input<Guide | null>(null);
  zIndex = input<number>(1055);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guideSaved = new EventEmitter<void>();

  readonly isEditMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly fileError = signal<string | null>(null);
  readonly backendError = signal<string | null>(null);

  selectedFile: File | null = null;

  guideForm: FormGroup = this.fb.group({
    guide_number: ['', Validators.required],
    issue_date: [''],
    is_active: [true]
  });

  ngOnInit() {
    const currentGuide = this.guide();
    if (currentGuide) {
      this.isEditMode.set(true);
      this.guideForm.patchValue({
        guide_number: currentGuide.guide_number,
        issue_date: currentGuide.issue_date,
        is_active: currentGuide.is_active,
      });
    } else {
      this.isEditMode.set(false);
      this.guideForm.reset({ is_active: true });
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileError.set(null);
    } else {
      this.selectedFile = null;
    }
  }

  save() {
    if (this.guideForm.invalid) {
      this.guideForm.markAllAsTouched();
      return;
    }

    if (!this.isEditMode() && !this.selectedFile) {
      this.fileError.set('Debe adjuntar un archivo (PDF/Imagen) para crear la guía.');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.guideForm.value;

    const data: any = {
      guide_number: formValue.guide_number,
      issue_date: formValue.issue_date,
      is_active: formValue.is_active
    };

    if (this.selectedFile) {
      data.attached_file = this.selectedFile;
    }

    if (this.isEditMode() && this.guide()) {
      this.guidesService.updateGuide(this.guide()!.id, data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.guideSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error actualizando guía', err);
          if (err.error?.errors?.guide_number) {
            this.backendError.set(err.error.errors.guide_number[0]);
          }
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.guidesService.createGuide(data).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.guideSaved.emit();
          this.close();
        },
        error: (err) => {
          console.error('Error creando guía', err);
          if (err.error?.errors?.guide_number) {
            this.backendError.set(err.error.errors.guide_number[0]);
          }
          this.isSubmitting.set(false);
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }
}
