export interface DocumentType {
  id: number | string;
  name: string;
  acronym: string;
  min_length: number;
  max_length: number;
  is_active: boolean;
}