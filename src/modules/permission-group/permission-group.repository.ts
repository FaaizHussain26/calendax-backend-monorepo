import { Inject, Injectable, Scope } from '@nestjs/common';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { AdminPermissionGroupEntity } from './permission-group.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminPermissionGroupRepository {
  constructor(
 @InjectRepository(AdminPermissionGroupEntity, 'master')
     private readonly repo: Repository<AdminPermissionGroupEntity>,
  ) {}


  async create(
    payload: Partial<AdminPermissionGroupEntity>,
  ): Promise<AdminPermissionGroupEntity> {
    return this.repo.save(this.repo.create(payload));
  }


  async findAll(): Promise<AdminPermissionGroupEntity[]> {
    return this.repo.find({
      relations: { permissions: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<AdminPermissionGroupEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { permissions: true },
    });
  }
 async findByIds(ids: string[]): Promise<AdminPermissionGroupEntity[]> {
    return this.repo.find({
      where: { id: In(ids) },
    });
  }
  async findByName(name: string): Promise<AdminPermissionGroupEntity | null> {
    return this.repo.findOne({
      where: { name },
    });
  }
  async findBySlug(slug: string): Promise<AdminPermissionGroupEntity | null> {
    return this.repo.findOne({ where: { slug } });
  }
async findDetailedByCondition(
  condition: FindOptionsWhere<AdminPermissionGroupEntity>,
): Promise<AdminPermissionGroupEntity | null> {
  return this.repo.findOne({
    where: condition,
    relations: { permissions: true },
    order: { createdAt: 'DESC' },
  });
}
  async update(
    id: string,
    payload: Partial<AdminPermissionGroupEntity>,
  ): Promise<void> {
    await this.repo.update(id, payload);
  }


  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }
}