import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { User, Role } from '../../../core/models/user.model';

declare const bootstrap: any;

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './users-list.html',
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  searchTerm = signal('');
  showPassword = signal(false);

  readonly availableRoles: Role[] = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Operador' },
  ];

  readonly userForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.minLength(6)]],
    first_name: ['', [Validators.required, Validators.maxLength(200)]],
    last_name: ['', [Validators.required, Validators.maxLength(200)]],
    role_ids: [[] as number[], [Validators.required]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar los usuarios.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredUsers.set(this.users());
      return;
    }
    this.filteredUsers.set(
      this.users().filter(
        (u) =>
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.first_name ?? '').toLowerCase().includes(term) ||
          (u.last_name ?? '').toLowerCase().includes(term)
      )
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.userForm.reset({ username: '', email: '', password: '', first_name: '', last_name: '', role_ids: [], is_active: true });
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.controls.password.updateValueAndValidity();
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.editingId.set(user.id);
    this.userForm.reset({
      username: user.username,
      email: user.email,
      password: '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      role_ids: user.roles.map(r => r.id),
      is_active: user.is_active,
    });
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();
    this.errorMsg.set(null);
    this.getModal().show();
  }

  isRoleSelected(roleId: number): boolean {
    return (this.userForm.controls.role_ids.value as number[]).includes(roleId);
  }

  toggleRole(roleId: number): void {
    const current = this.userForm.controls.role_ids.value as number[];
    const updated = current.includes(roleId)
      ? current.filter(id => id !== roleId)
      : [...current, roleId];
    this.userForm.controls.role_ids.setValue(updated);
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const { username, email, password, first_name, last_name, role_ids, is_active } = this.userForm.getRawValue();

    if (this.isEditing()) {
      const dto: any = { username, email, first_name, last_name, role_ids, is_active };
      if (password) dto.password = password;
      this.usersService.update(this.editingId()!, dto).subscribe({
        next: () => { this.getModal().hide(); this.showSuccess('Usuario actualizado.'); this.loadUsers(); },
        error: (err) => this.errorMsg.set(err?.error?.message || 'Error al actualizar.'),
      });
    } else {
      this.usersService.create({ username, email, password, first_name, last_name, role_ids, is_active }).subscribe({
        next: () => { this.getModal().hide(); this.showSuccess('Usuario creado.'); this.loadUsers(); },
        error: (err) => this.errorMsg.set(err?.error?.message || 'Error al crear.'),
      });
    }
  }

  toggleActive(user: User): void {
    this.usersService.toggleActive(user.id).subscribe({
      next: () => { this.showSuccess(`Usuario ${user.is_active ? 'desactivado' : 'activado'}.`); this.loadUsers(); },
      error: () => this.errorMsg.set('Error al cambiar estado.'),
    });
  }

  getFullName(user: User): string {
    return [user.first_name, user.last_name].filter(v => !!v).join(' ') || '—';
  }

  getRoleNames(user: User): string {
    return user.roles?.map(r => r.name).join(', ') || '—';
  }

  isFieldInvalid(field: 'username' | 'email' | 'password' | 'role_ids' | 'first_name' | 'last_name'): boolean {
    const control = this.userForm.controls[field];
    return control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal'));
  }
}
