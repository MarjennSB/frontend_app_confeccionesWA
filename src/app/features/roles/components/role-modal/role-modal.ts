import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '../../../../core/services/roles.service';
import { Role } from '../../../../core/models/role.model';

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-modal.html',
})
export class RoleModalComponent {
  isOpen = input<boolean>(false);
  role = input<Role | null>(null);
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() roleSaved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);

  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);

  roleForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const currentRole = this.role();
        if (currentRole) {
          this.isEditMode.set(true);
          this.roleForm.patchValue({
            name: currentRole.name
          });
        } else {
          this.isEditMode.set(false);
          this.roleForm.reset();
        }
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (this.roleForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.roleForm.value;

    const request$ = this.isEditMode() && this.role()
      ? this.rolesService.updateRole(this.role()!.id as string, formData)
      : this.rolesService.createRole(formData);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.roleSaved.emit();
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error al guardar rol', err);
        alert('Ocurrió un error al guardar el rol.');
      }
    });
  }
}