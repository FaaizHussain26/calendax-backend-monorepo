import {
    BadRequestException as NestBadRequestException,
    InternalServerErrorException as NestInternalServerErrorException,
    NotFoundException as NestNotFoundException,
} from '@nestjs/common';

enum ErrorType {
    BAD_TOKEN = 'BadTokenError',
    INTERNAL = 'InternalError',
    NOT_FOUND = 'NotFoundError',
    NO_ENTRY = 'NoEntryError',
    NO_DATA = 'NoDataError',
    BAD_REQUEST = 'BadRequestError',
    FORBIDDEN = 'ForbiddenError',
}

export class InternalServerErrorException extends NestInternalServerErrorException {
    constructor(message = 'Internal error', details?: any) {
        super(
            { errorType: ErrorType.INTERNAL, message, details },
            'Internal Server Error',
        );
    }
}

export class BadRequestException extends NestBadRequestException {
    constructor(message: string | object = 'Bad Request', details?: any) {
        super(
            { errorType: ErrorType.BAD_REQUEST, message, details },
            'Bad Request',
        );
    }
}

export class NotFoundException extends NestNotFoundException {
    constructor(message: string | object = 'Not Found', details?: any) {
        super(
            { errorType: ErrorType.NOT_FOUND, message, details },
            'Not Found',
        );
    }
}

export class NoEntryException extends NestBadRequestException {
    constructor(message: string | object = "Entry doesn't exist", details?: any) {
        super(
            { errorType: ErrorType.NO_ENTRY, message, details },
            "No Entry Found",
        );
    }
}

export class NoDataException extends NestBadRequestException {
    constructor(message: string | object = 'No data available', details?: any) {
        super(
            { errorType: ErrorType.NO_DATA, message, details },
            'No Data Available',
        );
    }
}
