import { Component, effect, EventEmitter, inject, input, Output, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService } from '../../../../core/services/content.service';
import { Content } from '../../../../core/models/content.model';
import { ContentTypesService } from '../../../../core/services/content-types.service';
import { ContentType } from '../../../../core/models/content-types.model';

@Component({
  selector: 'app-content-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './content-modal.html',
})
export class ContentModalComponent implements OnInit {
  isOpen = input<boolean>(false);
  content = input<Content | null>(null);
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() contentSaved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly contentService = inject(ContentService);
  private readonly contentTypesService = inject(ContentTypesService);

  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);
  readonly contentTypes = signal<ContentType[]>([]);

  contentForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    subtitle: ['', [Validators.maxLength(255)]],
    description: [''],
    content_type_id: [null, [Validators.required]],
    destination_url: ['', [Validators.maxLength(500)]],
    image_url: ['', [Validators.maxLength(500)]],
    start_date: [null],
    end_date: [null],
    display_order: [0],
    is_active: [true]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const currentContent = this.content();
        if (currentContent) {
          this.isEditMode.set(true);
          
          // Format dates for input type="datetime-local" or "date"
          let formattedStartDate = null;
          let formattedEndDate = null;
          
          if (currentContent.start_date) {
             const sd = new Date(currentContent.start_date);
             formattedStartDate = sd.toISOString().slice(0, 16);
          }
          if (currentContent.end_date) {
             const ed = new Date(currentContent.end_date);
             formattedEndDate = ed.toISOString().slice(0, 16);
          }

          this.contentForm.patchValue({
            title: currentContent.title,
            subtitle: currentContent.subtitle,
            description: currentContent.description,
            content_type_id: currentContent.content_type_id,
            destination_url: currentContent.destination_url,
            image_url: currentContent.image_url,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            display_order: currentContent.display_order,
            is_active: currentContent.is_active
          });
        } else {
          this.isEditMode.set(false);
          this.contentForm.reset({
            display_order: 0,
            is_active: true
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.contentTypesService.getContentTypes().subscribe({
      next: (res) => {
        if ('data' in res) {
          this.contentTypes.set(res.data);
        } else {
          this.contentTypes.set(res as ContentType[]);
        }
      },
      error: (err) => console.error('Error cargando tipos de contenido', err)
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (this.contentForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.contentForm.value;

    const request$ = this.isEditMode() && this.content()
      ? this.contentService.updateContent(this.content()!.id as string, formData)
      : this.contentService.createContent(formData);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.contentSaved.emit();
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error al guardar contenido', err);
        alert('Ocurrió un error al guardar el contenido.');
      }
    });
  }
}
