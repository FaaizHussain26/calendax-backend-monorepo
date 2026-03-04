import { BadRequestException } from "@nestjs/common/exceptions/bad-request.exception";

export class UserNotFoundException extends BadRequestException {
    constructor() {
        super('This user do not exists.')
    }
}
