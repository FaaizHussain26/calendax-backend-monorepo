// src/modules/tenant-modules/users/users.repository.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable({ scope: Scope.REQUEST })        // 👈 request scoped
export class UsersRepository {
  constructor(
    @Inject('UserEntityRepository')          // 👈 matches provide key
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findAll() {
    return this.repo.find();
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(payload: Partial<UserEntity>) {
    return this.repo.save(this.repo.create(payload));
  }

  async update(id: string, payload: Partial<UserEntity>) {
    return this.repo.update(id, payload);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}