import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

  profile = signal<User | null>(null);
  isLoading = signal(true);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res.usuario);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar el perfil.');
        this.isLoading.set(false);
      },
    });
  }


  getInitials(): string {
    const p = this.profile();
    if (!p) return '?';
    const parts = [p.first_name, p.last_name_father].filter(v => !!v);
    return parts.length > 0
      ? parts.map(w => w!.charAt(0).toUpperCase()).join('')
      : (p.name ?? p.email).charAt(0).toUpperCase();
  }

  getFullName(): string {
    const p = this.profile();
    if (!p) return '';
    return [p.first_name, p.last_name_father, p.last_name_mother]
      .filter(v => !!v).join(' ') || p.name || p.email;
  }

  // Properties to fix TS errors in profile.html
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly isChangingPassword = signal(false);

  onChangePassword(): void {
    alert('Cambio de contraseña no implementado aún.');
  }
}
