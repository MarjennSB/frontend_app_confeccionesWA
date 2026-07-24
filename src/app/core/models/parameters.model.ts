import { ResponsibleOfficer } from './responsible-officer.model';

export interface Parameters {
  id: number;
  organization_name: string;
  year: number;
  motto_of_the_year?: string;
  name_template?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  responsible_officer?: ResponsibleOfficer;
}

export interface CreateParametersDto {
  organization_name: string;
  year: number;
  motto_of_the_year: string;
  responsible_officer_id?: number | null;
  is_active?: boolean;
}

export interface UpdateParametersDto {
  organization_name?: string;
  year?: number;
  motto_of_the_year?: string;
  responsible_officer_id?: number | null;
  is_active?: boolean;
}
