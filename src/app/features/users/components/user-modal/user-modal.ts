import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { RolesService } from '../../../../core/services/roles.service';
import { DocumentTypesService } from '../../../../core/services/document-types.service';
import { GenresService } from '../../../../core/services/genres.service';
import { User } from '../../../../core/models/user.model';
import { Role } from '../../../../core/models/role.model';
import { DocumentType } from '../../../../core/models/document-type.model';
import { Genre } from '../../../../core/models/genre.model';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-modal.html',
})
export class UserModalComponent {
  isOpen = input<boolean>(false);
  user = input<User | null>(null);
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly documentTypesService = inject(DocumentTypesService);
  private readonly genresService = inject(GenresService);

  readonly roles = signal<Role[]>([]);
  readonly documentTypes = signal<DocumentType[]>([]);
  readonly genres = signal<Genre[]>([]);
  
  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);

  userForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    document_type_id: ['', Validators.required],
    document_number: ['', Validators.required],
    genre_id: [''],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role_id: ['', Validators.required],
    is_active: [true]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadSelectData();
        const currentUser = this.user();
        if (currentUser) {
          this.isEditMode.set(true);
          this.userForm.patchValue({
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            document_type_id: currentUser.document_type_id,
            document_number: currentUser.document_number,
            genre_id: currentUser.genre_id,
            username: currentUser.username,
            email: currentUser.email,
            password: '',
            role_id: currentUser.roles && currentUser.roles.length > 0 ? currentUser.roles[0].id : '',
            is_active: currentUser.is_active
          });
          this.userForm.get('password')?.clearValidators();
        } else {
          this.isEditMode.set(false);
          this.userForm.reset({ is_active: true });
          this.userForm.get('password')?.setValidators([Validators.required]);
        }
        this.userForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  loadSelectData(): void {
    if (this.roles().length === 0) {
      this.rolesService.getRoles().subscribe({
        next: (res) => this.roles.set(res.data),
        error: (err) => console.error('Error cargando roles', err)
      });
    }
    if (this.documentTypes().length === 0) {
      this.documentTypesService.getDocumentTypes().subscribe({
        next: (res) => this.documentTypes.set(res.data),
        error: (err) => console.error('Error cargando tipos de documento', err)
      });
    }
    if (this.genres().length === 0) {
      this.genresService.getGenres().subscribe({
        next: (res) => this.genres.set(res.data),
        error: (err) => console.error('Error cargando géneros', err)
      });
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);
    const formData = this.userForm.value;
    
    // Solo enviamos el password si fue modificado
    if (!formData.password) {
      delete formData.password;
    }

    const request$ = this.isEditMode() && this.user()
      ? this.usersService.updateUser(this.user()!.id, formData)
      : this.usersService.createUser(formData);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.userSaved.emit();
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error al guardar', err);
        alert('Ocurrió un error al guardar el usuario.');
      }
    });
  }
}