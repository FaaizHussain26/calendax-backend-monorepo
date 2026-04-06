// site.repository.ts
import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Site } from './site.entity';
import { UserEntity } from '../user/user.entity';

@Injectable({ scope: Scope.REQUEST }) // 👈 REQUEST scope — tenant DB connection
export class SiteRepository {
  constructor(
    @Inject(`${Site.name}Repository`)
    private readonly repo: Repository<Site>,
  ) {}

  async findAll(query: {
    search?: string;
    page?: number;
    limit?: number;
    all?: boolean;
  }) {
    const { search, page = 1, limit = 10, all = false } = query;

    const [data, total] = await this.repo.findAndCount({
      where: search
        ? [{ name: ILike(`%${search}%`) }, { city: ILike(`%${search}%`) }]
        : {},
      relations: { siteUsers: true },
      order: { createdAt: 'DESC' },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Site | null> {
    return this.repo.findOne({
      where: { id },
      relations: { siteUsers: true },
    });
  }
async findByIds(ids:string[]){
return this.repo.find({where:{id:In(ids)}})
}
 async findByAssignedUser(userId: string): Promise<Site[]> {
  return await this.repo.find({
    where: { siteUsers: { id: userId } },
    relations: { siteUsers: true },
  });
}

  async findOneByCondition(condition: FindOptionsWhere<Site>): Promise<Site | null> {
    return this.repo.findOne({ where: condition });
  }

  async create(data: Partial<Site>): Promise<Site> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Site>): Promise<Site | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async assignUsers(siteId: string, users: UserEntity[]): Promise<void> {
    const site = await this.repo.findOne({
      where: { id: siteId },
      relations: { siteUsers: true },
    });
    if (!site) throw new NotFoundException('Site not found');
    site.siteUsers = users;
    await this.repo.save(site);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}