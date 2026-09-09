import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notification } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './notification-modal.html',
})
export class NotificationModalComponent {
  isOpen = input<boolean>(false);
  notification = input<Notification | null>(null);
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() notificationSaved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);

  notificationForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    message: ['', [Validators.required]],
    image_url: ['', [Validators.maxLength(500)]],
    destination_url: ['', [Validators.maxLength(500)]],
    start_date: [null],
    end_date: [null],
    is_active: [true]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const currentNotification = this.notification();
        if (currentNotification) {
          this.isEditMode.set(true);
          
          // Format dates for input type="datetime-local"
          let formattedStartDate = null;
          let formattedEndDate = null;
          
          if (currentNotification.start_date) {
             const sd = new Date(currentNotification.start_date);
             formattedStartDate = sd.toISOString().slice(0, 16);
          }
          if (currentNotification.end_date) {
             const ed = new Date(currentNotification.end_date);
             formattedEndDate = ed.toISOString().slice(0, 16);
          }

          this.notificationForm.patchValue({
            title: currentNotification.title,
            message: currentNotification.message,
            image_url: currentNotification.image_url,
            destination_url: currentNotification.destination_url,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            is_active: currentNotification.is_active
          });
        } else {
          this.isEditMode.set(false);
          this.notificationForm.reset({
            is_active: true
          });
        }
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (this.notificationForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.notificationForm.value;

    const request$ = this.isEditMode() && this.notification()
      ? this.notificationService.updateNotification(this.notification()!.id as string, formData)
      : this.notificationService.createNotification(formData);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationSaved.emit();
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error al guardar notificación', err);
        alert('Ocurrió un error al guardar la notificación.');
      }
    });
  }
}
