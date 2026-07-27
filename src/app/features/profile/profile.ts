import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService, ProfileData } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

  profile = signal<ProfileData | null>(null);
  isLoading = signal(true);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  isChangingPassword = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar el perfil.');
        this.isLoading.set(false);
      },
    });
  }

  onChangePassword(): void {
    this.successMsg.set(null);
    this.errorMsg.set(null);

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMsg.set('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.errorMsg.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isChangingPassword.set(true);
    this.profileService.changePassword({
      current_password: this.currentPassword(),
      new_password: this.newPassword(),
    }).subscribe({
      next: (res) => {
        this.successMsg.set(res.message);
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
        this.isChangingPassword.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Error al cambiar la contraseña.');
        this.isChangingPassword.set(false);
      },
    });
  }

  getInitials(): string {
    const p = this.profile();
    if (!p) return '?';
    const parts = [p.first_name, p.last_name].filter(v => !!v);
    return parts.length > 0
      ? parts.map(w => w!.charAt(0).toUpperCase()).join('')
      : p.username.charAt(0).toUpperCase();
  }

  getFullName(): string {
    const p = this.profile();
    if (!p) return '';
    return [p.first_name, p.last_name].filter(v => !!v).join(' ') || p.username;
  }
}
