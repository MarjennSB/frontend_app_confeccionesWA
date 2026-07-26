export interface ResponsibleOfficer {
  id: number;
  document_number: string;
  name: string;
  initials: string;
  charge?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateResponsibleOfficerDto {
  document_number: string;
  name: string;
  initials: string;
  charge?: string;
  is_active?: boolean;
}

export interface UpdateResponsibleOfficerDto {
  document_number?: string;
  name?: string;
  initials?: string;
  charge?: string;
  is_active?: boolean;
}
