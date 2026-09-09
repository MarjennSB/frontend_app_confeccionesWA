import { Component, effect, EventEmitter, inject, input, Output, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../../../../core/services/service.service';
import { Service } from '../../../../core/models/service.model';
import { ServiceTypesService } from '../../../../core/services/service-types.service';
import { ServiceTypes } from '../../../../core/models/service-types.model';

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './service-modal.html',
})
export class ServiceModalComponent implements OnInit {
  isOpen = input<boolean>(false);
  service = input<Service | null>(null);
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() serviceSaved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly serviceService = inject(ServiceService);
  private readonly serviceTypesService = inject(ServiceTypesService);

  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);
  readonly serviceTypes = signal<ServiceTypes[]>([]);

  serviceForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    subtitle: ['', [Validators.maxLength(255)]],
    description: [''],
    service_type_id: [null, [Validators.required]],
    destination_url: ['', [Validators.maxLength(500)]],
    image_url: ['', [Validators.maxLength(500)]],
    display_order: [0],
    is_active: [true]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const currentService = this.service();
        if (currentService) {
          this.isEditMode.set(true);
          this.serviceForm.patchValue({
            title: currentService.title,
            subtitle: currentService.subtitle,
            description: currentService.description,
            service_type_id: currentService.service_type_id,
            destination_url: currentService.destination_url,
            image_url: currentService.image_url,
            display_order: currentService.display_order,
            is_active: currentService.is_active
          });
        } else {
          this.isEditMode.set(false);
          this.serviceForm.reset({
            display_order: 0,
            is_active: true
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.serviceTypesService.getServiceTypes().subscribe({
      next: (res) => {
        if ('data' in res) {
          this.serviceTypes.set(res.data);
        } else {
          this.serviceTypes.set(res as ServiceTypes[]);
        }
      },
      error: (err) => console.error('Error loading service types', err)
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (this.serviceForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.serviceForm.value;

    const request$ = this.isEditMode() && this.service()
      ? this.serviceService.updateService(this.service()!.id as string, formData)
      : this.serviceService.createService(formData);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.serviceSaved.emit();
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error al guardar servicio', err);
        alert('Ocurrió un error al guardar el servicio.');
      }
    });
  }
}
