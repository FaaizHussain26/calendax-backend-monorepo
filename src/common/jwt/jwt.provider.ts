import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";

export interface JwtPayload {
  sub: string;
  role: string;  //maybe change later
  jti: string;
  exp?: string;
}

@Injectable()
export class JwtHelper {
  constructor(private readonly jwtService: JwtService) {}
 
  issueToken(user: any) {
    const payload: JwtPayload = {
      sub: user._id?.toString(),
      role: user.role,
      jti: randomUUID(), // 👈 UNIQUE TOKEN ID
    };
 
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}