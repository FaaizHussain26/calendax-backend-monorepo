import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IndicationRepository } from './indication.repository';
import { CreateAdminDto } from '../../admin/admin.dto';
import { HelperFunctions } from '../../../common/utils/functions';
import { CreateIndicationDto, UpdateIndicationDto } from './indication.dto';
import { IndicationEntity } from './indication.entity';

@Injectable()
export class IndicationService {
  constructor(private readonly repository: IndicationRepository) {}

  async findAll(query: PaginationDto) {
    return this.repository.findAll(query);
  }
    async findById(id: string): Promise<IndicationEntity> {
    const indication = await this.repository.findById(id);
    if (!indication) throw new NotFoundException('Indication not found');
    return indication;
  }
  async create(dto: CreateIndicationDto) :Promise<IndicationEntity> {
    const slug = HelperFunctions.generateSlug(dto.name);
    const existing = await this.repository.findOneByCondition({ slug: slug });
    if (existing) throw new ConflictException('Site Already Exists with this name');
   return await this.repository.create({ ...dto, slug });
  }
  async update(id: string, dto: UpdateIndicationDto): Promise<IndicationEntity|null> {
    await this.findById(id);

    const updateData: Partial<IndicationEntity> = {};

    if (dto.name) {
      const slug = HelperFunctions.generateSlug(dto.name);
      const existing = await this.repository.findOneByCondition({slug:slug});
      if (existing && existing.id !== id) {
        throw new ConflictException('Indication already exists with this name');
      }
      updateData.name = dto.name;
      updateData.slug = slug;
    }

    return this.repository.update(id, updateData);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
