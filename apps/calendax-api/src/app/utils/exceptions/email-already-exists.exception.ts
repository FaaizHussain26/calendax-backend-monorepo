import { ConflictException } from '@nestjs/common';

export class EmailAlreadyExistsException extends ConflictException {
    constructor(message = 'email already exists') {
        super(message)
    }
}
