const fs = require('fs');
const file = 'src/app/core/services/token.ts';
let content = fs.readFileSync(file, 'utf8');
const oldRegex = /hasRole\(\.\.\.roles: string\[\]\): boolean \{[\s\S]*?return roles\.includes\(userRoleStr\);\s*\}/g;
const newCode =   hasRole(...roles: string[]): boolean {
    const currentRoles = this.userRoles();
    console.log('Roles en memoria:', currentRoles, 'Buscando:', roles);
    if (!currentRoles || currentRoles.length === 0) return false;
    return roles.some(role => currentRoles.includes(role));
  };
content = content.replace(oldRegex, newCode);
fs.writeFileSync(file, content);