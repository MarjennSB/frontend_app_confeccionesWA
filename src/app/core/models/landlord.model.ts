import { TypeDocument } from './type-document.model';

export interface Landlord {
  id: string;
  document_number: string;
  first_name?: string;
  last_name?: string;
  last_name_mother?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  type_document?: TypeDocument;
}

export interface CreateLandlordDto {
  document_number: string;
  first_name?: string;
  last_name?: string;
  last_name_mother?: string;
  email?: string;
  phone?: string;
  address?: string;
  type_document_id?: number | null;
  is_active?: boolean;
}

export interface UpdateLandlordDto {
  document_number?: string;
  first_name?: string;
  last_name?: string;
  last_name_mother?: string;
  email?: string;
  phone?: string;
  address?: string;
  type_document_id?: number | null;
  is_active?: boolean;
}
