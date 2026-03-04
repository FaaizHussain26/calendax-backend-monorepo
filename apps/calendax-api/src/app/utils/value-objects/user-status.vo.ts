import { z } from "zod";

export enum UserStatus {
    Active = 'active',
    Blocked = 'blocked',
    Inactive = 'inactive',
  }
  

export const UserStatusSchema = z.enum(['active', 'blocked', 'inactive']);
