import { PageEntity } from "../../modules/page/page.entity";

export interface PagePermissions {
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

export interface PageWithPermissions extends PageEntity{
  permissions: PagePermissions;
}