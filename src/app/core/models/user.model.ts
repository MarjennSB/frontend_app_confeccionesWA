import { DocumentType } from './document-type.model';
import { Genre } from './genre.model';
import { Role } from './role.model';

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  username: string;
  email: string;
  document_number?: string;
  document_type_id?: number | string;
  genre_id?: number | string;
  tipoDocumento?: DocumentType;
  genre?: Genre;
  role_id?: string | number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}