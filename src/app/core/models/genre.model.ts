export interface Genre {
  id: number | string;
  name: string;
  acronym: string;
  description?: string;
  is_active: boolean;
}