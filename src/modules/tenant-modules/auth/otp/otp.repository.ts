// src/modules/tenant-modules/auth/otp/otp.repository.ts
import { Inject, Injectable, Scope } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { OtpEntity } from './otp.entity';
import { OtpPurpose } from '../../../../enums/system.enum';

@Injectable({ scope: Scope.REQUEST })
export class OtpRepository {
  constructor(
    @Inject(`${OtpEntity.name}Repository`)
    private readonly repo: Repository<OtpEntity>,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(payload: Partial<OtpEntity>): Promise<OtpEntity> {
    return this.repo.save(this.repo.create(payload));
  }

  // ─── Find ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<OtpEntity[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<OtpEntity | null> {
    return this.repo.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<OtpEntity[]> {
    return this.repo.find({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestUnverified(email: string, purpose: OtpPurpose): Promise<OtpEntity | null> {
    return this.repo.findOne({
      where: {
        email,
        purpose,
        verified: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, payload: Partial<OtpEntity>): Promise<void> {
    await this.repo.update(id, payload);
  }

  async incrementAttempts(id: string, currentAttempts: number): Promise<void> {
    await this.repo.update(id, {
      attempts: currentAttempts + 1,
    });
  }

  async markVerified(id: string): Promise<void> {
    await this.repo.update(id, { verified: true });
  }

  async invalidateExisting(email: string, purpose: OtpPurpose): Promise<void> {
    await this.repo.update({ email, purpose, verified: false }, { expiresAt: new Date() });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.repo.delete({ email });
  }

  async deleteExpired(): Promise<void> {
    await this.repo.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
