import { Component, inject, OnInit, signal } from '@angular/core';
import { RolesService } from '../../../core/services/roles.service';
import { Role } from '../../../core/models/role.model';
import { RoleModalComponent } from '../components/role-modal/role-modal';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [RoleModalComponent],
  templateUrl: './roles-list.html',
})
export class RolesListComponent implements OnInit {
  private readonly rolesService = inject(RolesService);

  readonly roles = signal<Role[]>([]);
  readonly isModalOpen = signal(false);
  readonly selectedRole = signal<Role | null>(null);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (res) => this.roles.set(res.data),
      error: (err) => console.error('Error cargando roles', err)
    });
  }

  openModal(role?: Role): void {
    this.selectedRole.set(role || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedRole.set(null);
  }
}