import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '../../../../core/services/roles.service';
import { Role } from '../../../../core/models/role.model';

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
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

  allPermissions = signal<any[]>([]);
  permissionsGrouped = signal<{module: string, permissions: any[]}[]>([]);
  selectedPermissions = signal<string[]>([]);

  roleForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

  ngOnInit() {
    this.loadPermissions();
  }

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const currentRole = this.role();
        if (currentRole) {
          this.isEditMode.set(true);
          this.roleForm.patchValue({
            name: currentRole.name
          });
          this.selectedPermissions.set(currentRole.permision_pluck || []);
        } else {
          this.isEditMode.set(false);
          this.roleForm.reset();
          this.selectedPermissions.set([]);
        }
      }
    });
  }

  loadPermissions() {
    this.rolesService.getPermissions().subscribe({
      next: (res) => {
        this.allPermissions.set(res.data);
        this.groupPermissions(res.data);
      }
    });
  }

  groupPermissions(perms: any[]) {
    const groups: {[key: string]: any[]} = {};
    perms.forEach(p => {
       const parts = p.name.split('_');
       const moduleName = parts.length > 1 ? parts[1] : 'general';
       if (!groups[moduleName]) groups[moduleName] = [];
       groups[moduleName].push(p);
    });
    
    const arr = Object.keys(groups).map(k => ({
      module: k.charAt(0).toUpperCase() + k.slice(1),
      permissions: groups[k]
    }));
    this.permissionsGrouped.set(arr);
  }

  togglePermission(permName: string) {
    const current = this.selectedPermissions();
    if (current.includes(permName)) {
      this.selectedPermissions.set(current.filter(p => p !== permName));
    } else {
      this.selectedPermissions.set([...current, permName]);
    }
  }

  isPermissionSelected(permName: string): boolean {
    return this.selectedPermissions().includes(permName);
  }

  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (this.roleForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = {
      ...this.roleForm.value,
      permisions: this.selectedPermissions()
    };

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