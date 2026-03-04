import { ConflictException } from '@nestjs/common';

export class PermissionGroupExistsException extends ConflictException {
    constructor(message = 'permission group already exists') {
        super(message)
    }
}
