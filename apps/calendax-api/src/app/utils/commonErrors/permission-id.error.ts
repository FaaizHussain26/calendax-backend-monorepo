import { BadRequestException } from "@nestjs/common";

export function validatePositiveIntegerId(id: number, label = 'ID') {
    if(!id || id < 1 || !Number.isInteger(id)) {
        throw new BadRequestException(`Invalid ${label}`);
    }
}