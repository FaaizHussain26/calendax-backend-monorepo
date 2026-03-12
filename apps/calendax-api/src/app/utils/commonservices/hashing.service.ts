import { Injectable } from "@nestjs/common";
import { HashedPassword, HashedPasswordSchema, PlainPassword } from "../value-objects/password.vo";
import * as bcrypt from 'bcrypt';
import { BadRequestException } from "../exceptions/common.exceptions";
const saltOrRounds = 10;

@Injectable()
export class HashingService {
    async hashPlainPassword(
        plainPassword: PlainPassword
    ): Promise<HashedPassword> {
        try {
            const hash = await bcrypt.hash(plainPassword, saltOrRounds);
            return await HashedPasswordSchema.parseAsync(hash);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async assertSamePassword(
        plainPassword: PlainPassword,
        hashedPassword: HashedPassword,
    ):Promise<boolean> {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch(error) {
            throw new BadRequestException(error.message);
        }
    }
}