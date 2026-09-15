// ============================================================
// role.model.ts
// Modelos de Rol y Permiso — alineados con ApiRoleController
// ============================================================

export interface Role {
  id: number | string;
  name: string;
  permision?: Permission[];
  permision_pluck?: string[];
  created_at?: string;
}

export interface Permission {
  id: number | string;
  name: string;
  guard_name?: string;
}

export interface CreateRoleDto {
  name: string;
  permisions?: string[];  // array de nombres de permisos
}

export interface UpdateRoleDto {
  name: string;
  permisions?: string[];  // array de nombres de permisos
}

export interface RoleListResponse {
  roles: Role[];
}