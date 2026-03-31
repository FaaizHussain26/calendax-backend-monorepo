import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PermissionGroupEntity } from './permission-group.entity';

@Injectable({ scope: Scope.REQUEST })
export class PermissionGroupRepository {
  constructor(
    @Inject('PermissionGroupEntityRepository')
    private readonly repo: Repository<PermissionGroupEntity>,
  ) {}


  async create(
    payload: Partial<PermissionGroupEntity>,
  ): Promise<PermissionGroupEntity> {
    return this.repo.save(this.repo.create(payload));
  }


  async findAll(): Promise<PermissionGroupEntity[]> {
    return this.repo.find({
      relations: { permissions: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PermissionGroupEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { permissions: true },
    });
  }

  async findByName(name: string): Promise<PermissionGroupEntity | null> {
    return this.repo.findOne({
      where: { name },
    });
  }


  async update(
    id: string,
    payload: Partial<PermissionGroupEntity>,
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