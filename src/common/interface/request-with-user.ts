import { Request } from "express";

export interface RequestWithUser extends Request {
  
    user: {
      id: string;
      role: string,
      tokenId: string,
      exp: string,
      permissions:any[],
    };
  
}