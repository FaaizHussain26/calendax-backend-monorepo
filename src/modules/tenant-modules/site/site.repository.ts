// site.repository.ts
import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { SiteEntity } from './site.entity';
import { UserEntity } from '../user/user.entity';
import { PaginationDto } from '@libs/common/dto/pagination.dto';

@Injectable({ scope: Scope.REQUEST }) // 👈 REQUEST scope — tenant DB connection
export class SiteRepository {
    private readonly baseSelect = {
    name: true,
    email: true,
    id: true,
    city: true,
    patientCount: true,
    siteNumber: true,
    indication: true,
    slug: true,
    users: { firstName: true, lastName: true, id: true },
  };

  constructor(
    @Inject(`${SiteEntity.name}Repository`)
    private readonly repo: Repository<SiteEntity>
  ) {}

  async findAll(query: PaginationDto) {
    const { search, page = 1, limit = 10, all = false } = query;

    const [data, total] = await this.repo.findAndCount({
      where: search ? [{ name: ILike(`%${search}%`) }, { city: ILike(`%${search}%`) }] : {},
      order: { createdAt: 'DESC' },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
      relations: { indication: true, users: true },
      select: this.baseSelect,
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<SiteEntity | null> {
    return this.repo.findOne({
      where: { id },
    });
  }
  async findDetailedById(id: string): Promise<SiteEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { indication: true, users: true },
      select: {
        ...this.baseSelect,
        createdAt: true,
        updatedAt: true,
        city: true,
        state: true,
        streetAddress: true,
        zipCode: true,
      },
    });
  }
  async findByIds(ids: string[]) {
    return this.repo.find({ where: { id: In(ids) } });
  }
  async findByAssignedUser(userId: string): Promise<SiteEntity[]> {
    return await this.repo.find({
      where: { users: { id: userId } },
      // relations: { users: true },
    });
  }

  async findOneByCondition(condition: FindOptionsWhere<SiteEntity>): Promise<SiteEntity | null> {
    return this.repo.findOne({ where: condition });
  }

  async create(data: Partial<SiteEntity>): Promise<SiteEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<SiteEntity>): Promise<SiteEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async assignUsers(siteId: string, users: UserEntity[]): Promise<void> {
    const site = await this.repo.findOne({
      where: { id: siteId },
      relations: { users: true },
    });
    if (!site) throw new NotFoundException('Site not found');
    site.users = users;
    await this.repo.save(site);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
