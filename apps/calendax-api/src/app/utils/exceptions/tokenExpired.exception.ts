import { UnauthorizedException } from "@nestjs/common";

export class TokenExpiredError extends UnauthorizedException {
    constructor(message = 'Token is expired') {
        super(message);
    }
}