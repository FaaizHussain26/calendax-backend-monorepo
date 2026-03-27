import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import { ConfigService } from "@nestjs/config";

export interface JwtPayload {
  sub: string;
  role: string;  //maybe change later
  jti: string;
  exp?: string;
}

@Injectable()
export class JwtHelper {
  constructor(private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
 
  issueToken(user: any) {
    const payload: JwtPayload = {
      sub: user.id?.toString(),
      role: user.role,
      jti: randomUUID(), // 👈 UNIQUE TOKEN ID
    };

    const options = {
      secret: this.configService.get<string>('JWT_ADMIN_SECRET_KEY'),
      expiresIn: this.configService.get<number>('JWT_ADMIN_TOKEN_EXPIRES_IN'),
    }
 
    return {
      accessToken: this.jwtService.sign(payload, options),
    };
  }
}