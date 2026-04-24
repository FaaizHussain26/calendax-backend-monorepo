


export interface PagePermissions {
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

export interface PageWithPermissions {
  id: string;
  name: string;
  slug: string;
  permissions: PagePermissions;
}