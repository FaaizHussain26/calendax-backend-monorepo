import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { promisify } from "util";
import { readFile } from "fs";
import { join } from "path";

export class JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    type: 'access' | 'refresh'
}

@Injectable()
export class JWTService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ){}


    readPublicKey(): Promise<String> {
        return promisify(readFile)(join(__dirname, '../../../pem-keys/pub-key.pem'), 'utf8');
    }


    private readPrivateKey(): Promise<String> {
        return promisify(readFile)(join(__dirname, '../../../pem-keys/private-key.pem'), 'utf8');
    }

    async generateAccesToken(id: number, email: string) {
        try {
            const key: String = await this.readPrivateKey();
            if (!key) throw new BadRequestException('Token Generation Failed')
            const payload = {
                sub: id,
                email: email,
                type: 'access',
            }
            const options = {
                secret: key,
                algorithm: 'RS256',
                expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRES_IN')
            } as any;
            return this.jwtService.sign(
                payload, options)
        } catch (error) {
            console.log(error);
            throw new BadRequestException("Failed to sign in!");
        }
    }


    async generateRefreshToken(id: number, email: string) {
        try{
            const key: String = await this.readPrivateKey();
            const payload = {
                sub: id,
                email: email,
                type: 'refresh'
            }
            const options = {
                secret: key,
                algorithm: 'RS256',
                expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN')
            } as any
            return this.jwtService.sign(
            payload, options)
        } catch (error) {
            throw new BadRequestException("Failed to generate refresh token")
        }
    }


    async refresh(refreshToken: string) {
        try{
            const payload = await this.jwtService.verifyAsync(refreshToken,
            {
                secret: this.readPublicKey(), 
            } as any
            )

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException("Invalid Token Type");
            }
            
            const newAccessToken = await this.generateAccesToken(
                payload.sub,
                payload.email
            )

            return {
                newAccessToken
            };
        }catch (error) {
            console.error('Refresh token error:', error.message);
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}   