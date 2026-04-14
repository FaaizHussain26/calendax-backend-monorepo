export enum AdminPage {
  USERS = 'USERS',
  FINANACE = 'FINANCE',
  TENANT = 'TENANT',
  PAGE = 'PAGE',
}

export enum AdminRoles {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum Roles {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// export enum AdminPage {
//   USERS = 'users',
//   FINANCE = 'finance',   // 👈 fixed typo FINANACE → FINANCE
//   TENANT = 'tenant',
//   PAGE = 'page',
// }

// export enum AdminRoles {
//   ADMIN = 'admin',
//   SUPER_ADMIN = 'super_admin',
// }

// // 👇 Roles and AdminRoles are identical — remove Roles and use AdminRoles everywhere
// export enum Roles {
//   ADMIN = 'admin',
//   SUPER_ADMIN = 'super_admin',
// }