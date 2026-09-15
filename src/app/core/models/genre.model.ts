// ============================================================
// genre.model.ts
// Modelo de Género (Gender) — alineado con la tabla genders del backend
// ============================================================

export interface Genre {
  id: number | string;
  name: string;
  acronym: string;
  is_active: boolean;
}