import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../database/user.orm";
import { DeepPartial, EntityManager, In, Repository } from "typeorm";
import { UpdateResult } from "typeorm/browser";
import { DeleteResult } from "typeorm/browser";

@Injectable()
export class UserRepository{
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){};


    async getByIDWithPI(id: number): Promise<User | null>{
        const user = await this.userRepository.findOne({
            where: {
                id: id,
                isPrincipalInvestigator: true,
            }
        });
        return user;
    }


    async findUsersByIds(ids: number[]): Promise<User[]>{
        if(!ids || ids.length === 0) return[];
        const users = await this.userRepository.find({
            where: { id: In(ids) },
            select: ['id', 'email', 'firstName', 'lastName'],
        });
        return users;
    }


    async getUserWithPI(): Promise<User[] | null>{
        const user = await this.userRepository
        .createQueryBuilder('user')
        .select('user.id', 'id')
        .addSelect('user.email', 'email')
        .addSelect("user.firstName || ' ' || user.lastName", 'fullName')
        .where('user.isPrincipalInvestigator = :isPI', { isPI: true })
        .getRawMany();
    return user;
    }


    async getById(userId: User['id']): Promise<any>{
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if(!user){
            return null;
        }
        return user;
    }


    async getByEmail(email: string): Promise<User | null>{
        const user = await this.userRepository.findOne({
            where: {email: email},
        });

        if(!user){
            return null;
        }
        return user;
    }

    async getByEmails(emails: User['email'][]): Promise<User[]> {
        if(!emails || emails.length === 0) {
            return [];
        }
        const users = await this.userRepository.find({
            where: { email: In(emails) },
            relations: ["roles", "permissions"],
        })
        return users || [];
    }


    async create(user: DeepPartial<User>,
        manager?: EntityManager,
    ): Promise<User>{
        const newUser = this.userRepository.create(user);
        return await this.userRepository.save(newUser);
    }


    async update(id: User['id'],
        user: DeepPartial<User>
    ): Promise<UpdateResult>{
        return await this.userRepository.update(id, user);
    }


    async delete(id: User['id']): Promise<DeleteResult>{
        return await this.userRepository.delete([id]);
    }
}