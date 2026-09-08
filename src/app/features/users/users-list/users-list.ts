import { Component, inject, OnInit, signal } from '@angular/core';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../core/models/user.model';
import { UserModalComponent } from '../components/user-modal/user-modal';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [UserModalComponent],
  templateUrl: './users-list.html',
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly users = signal<User[]>([]);
  readonly isModalOpen = signal(false);
  readonly selectedUser = signal<User | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (res) => this.users.set(res.data),
      error: (err: any) => console.error('Error cargando usuarios', err)
    });
  }

  openModal(user?: User): void {
    this.selectedUser.set(user || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
  }

  deleteUser(id: string): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err: any) => alert('Error al eliminar usuario')
      });
    }
  }
}