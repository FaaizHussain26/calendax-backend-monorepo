import { UnauthorizedException } from "@nestjs/common";

export class BadTokenException extends UnauthorizedException {
    constructor() {
        super('Token is not valid.')
    }
}
