import { Injectable, RequestTimeoutException } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { BadRequestException } from "../../utils/exceptions/common.exceptions";
import { User } from "../database/user.orm";
import { TimeoutError } from "rxjs";
import { DeleteResult, EntityManager } from "typeorm";
import { CreateUserRequestDto } from "../dtos/create-user-request.dto";
import { EmailAlreadyExistsException } from "../../utils/exceptions/email-already-exists.exception";
import { HashingService } from "../../utils/commonservices/hashing.service";
import { UpdateUserRequestDto } from "../dtos/update-user-request.dto";
import { PlainPassword } from "../../utils/value-objects/password.vo";
import { validatePositiveIntegerId } from "../../utils/commonErrors/permission-id.error";
import { assertFound } from "../../utils/exceptions/not-found.exception";
import { HandleDBError } from "../../utils/commonErrors/handle-db.error";
import { UserExistsException } from "../../utils/exceptions/user-exists.exception";

@Injectable()
export class UserService{
    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashingService: HashingService,
        private readonly DBError: HandleDBError,
    ){}


    async getUser(userId: User['id']): Promise<User>{
        validatePositiveIntegerId(userId, 'User ID');
        try{
            const user = await this.userRepository.getById(userId);
            assertFound(user, "User");
            return user;
        }catch(error){
            throw new BadRequestException(error.message);
        }
    }


    async getUserByEmail(email: string): Promise<User> {
        if (!email) {
            throw new BadRequestException('Email is required');
        }
        const user = await this.userRepository.getByEmail(email)
        assertFound(user, "User");
        return user;
    }


    async getUserWithPI(){
        return await this.userRepository.getUserWithPI(); 
    }    


    async getUserByIdWithPI(id: number): Promise<User>{
        try{
            const user = await this.userRepository.getByIDWithPI(id);
            assertFound(user, "User");
            return user;
        }catch(error){
            throw new BadRequestException(error.message);
        }
    }


    async createUser(payload: CreateUserRequestDto,
        manager?: EntityManager,
    ): Promise<User>{
        const exitingUser = await this.userRepository.getByEmail(payload.email);
        if (exitingUser){ throw new EmailAlreadyExistsException();}
        // const hashedPass = await bcrypt.hash(payload.password, 10);
        const hashedPass = await this.hashingService.hashPlainPassword(payload.password);
        const newUser = await this.userRepository.create({
            ...payload,
            password: hashedPass
        });
        return newUser;
    }

    async updateUser(id: number, payload: UpdateUserRequestDto): Promise<User> {
        validatePositiveIntegerId(id, 'User ID');
        
        const user = await this.userRepository.getById(id);
        assertFound(user, "User");

        try {
            if (payload.password) {
                const hashedPass = await this.hashingService.hashPlainPassword(payload.password);
                payload.password = hashedPass as PlainPassword;
            }
            await this.userRepository.update(id, payload);
            return await this.userRepository.getById(id);
        } catch (error) {
            throw this.DBError.handleDBError(error, new UserExistsException(error?.message));
        }
    }


    async deleteUser(id: User['id']): Promise<DeleteResult>{
        let userEntity = await this.userRepository.getById(id);
        assertFound(userEntity, "User");
        try{
            return await this.userRepository.delete(id);
        }catch(error){
            if(error instanceof TimeoutError){
                throw new RequestTimeoutException();
            }else{
                throw new BadRequestException(error.message);
            }
        }
    }
}