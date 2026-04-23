// src/modules/tenant-modules/users/users.repository.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { TenantUserRoles } from '../../../common/enums/tenant.enum';
const userFields = {
  id: true,
  firstName: true,
  lastName: true,
  middleName: true,
  email: true,
  phoneNumber: true,
  isActive: true,
  userType: true,
  roleId: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};
@Injectable({ scope: Scope.REQUEST })
export class UsersRepository {
  constructor(
    @Inject(`${UserEntity.name}Repository`)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findAll() {
    return this.repo.find();
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email }, select: { ...userFields, password: true } });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  async findAllWithDetails(query: {
    userType?: TenantUserRoles;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { userType, isActive, search, page = 1, limit = 10 } = query;
    const baseWhere: FindOptionsWhere<UserEntity> = {
      ...(userType && { userType }),
      ...(isActive !== undefined && { isActive }),
    };
    let relations: { role: { permissions: boolean }; permissions: boolean; sites?: boolean } = {
      role: { permissions: true },
      permissions: true,
    };
    if (userType === TenantUserRoles.PRINCIPLE_INVESTIGATOR) {
      relations.sites = true;
    }
    const [data, total] = await this.repo.findAndCount({
      where: search
        ? [
            { ...baseWhere, firstName: ILike(`%${search}%`) },
            { ...baseWhere, lastName: ILike(`%${search}%`) },
            { ...baseWhere, email: ILike(`%${search}%`) },
          ]
        : baseWhere,
      relations: relations,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }
  async findDetailsById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        role: { permissions: true },
        permissions: true,
      },
      select: userFields,
    });
  }
  async findByIds(ids: string[]): Promise<UserEntity[]> {
    return this.repo.find({
      where: { id: In(ids) },
    });
  }

  async create(payload: Partial<UserEntity>) {
    return this.repo.save(this.repo.create(payload));
  }

  async update(id: string, payload: Partial<UserEntity>) {
    return this.repo.update(id, payload);
  }
  async findOneAndUpdate(condition: FindOptionsWhere<UserEntity>, payload: Partial<UserEntity>) {
    return this.repo.update(condition, payload);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }
}
