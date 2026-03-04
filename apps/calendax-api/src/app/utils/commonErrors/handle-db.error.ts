import { BadRequestException, HttpException, RequestTimeoutException } from "@nestjs/common";
import { DBErrorCode } from "../value-objects/db-error-code-enum";
import { TimeoutError } from "rxjs";

export class HandleDBError {
    handleDBError(error: any, uniqueConstraintException: HttpException): never {
        const errorMap = [
            {
                condition: () => error.code === DBErrorCode.PgUniqueConstraintViolation,
                exception: uniqueConstraintException,
            },
            {
                condition: () => error instanceof TimeoutError,
                exception: new RequestTimeoutException,
            },
        ];

        const matched = errorMap.find(({ condition }) => condition());
        throw matched ? matched.exception : new BadRequestException(error.message);
    }
}