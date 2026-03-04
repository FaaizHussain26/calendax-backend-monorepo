import { ConflictException } from '@nestjs/common';

export class    PatientAlreadyExistsException extends ConflictException {
    constructor(message = 'Patient already exists') {
        super(message)
    }
}
