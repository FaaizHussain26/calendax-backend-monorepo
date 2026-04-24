import { Inject, Scope } from '@nestjs/common';
import {
  Collection,
  Db,
  Filter,
  UpdateFilter,
  InsertManyResult,
  DeleteResult,
  WithId,
  OptionalUnlessRequiredId,
} from 'mongodb';
import { BaseMongoDocument } from '@libs/common//interfaces/mongo.interface';


export abstract class BaseMongoRepository<T extends BaseMongoDocument> {
  protected collection: Collection<T>;

  constructor(
    protected readonly mongo: Db,
    protected readonly collectionName: string,
  ) {
    if (!mongo) throw new Error(`MongoDB connection not available for collection: ${collectionName}`);
    this.collection = mongo.collection<T>(collectionName);
  }

  async insertOne(doc: Omit<T, '_id'>): Promise<void> {
    await this.collection.insertOne({
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as OptionalUnlessRequiredId<T>); // 👈
  }

 async insertMany(docs: Omit<T, '_id'>[]): Promise<InsertManyResult> {
    if (!docs.length) throw new Error('No documents to insert');
    return this.collection.insertMany(
      docs.map((doc) => ({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as OptionalUnlessRequiredId<T>[], // 👈
    );
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    return this.collection.findOne(filter);
  }

  async findMany(filter: Filter<T> = {}): Promise<WithId<T>[]> {
    return this.collection.find(filter).toArray();
  }

  async updateOne(filter: Filter<T>, update: UpdateFilter<T>): Promise<void> {
    await this.collection.updateOne(filter, {
      ...update,
      $set: { ...((update as any).$set ?? {}), updatedAt: new Date() },
    });
  }

  async deleteOne(filter: Filter<T>): Promise<DeleteResult> {
    return this.collection.deleteOne(filter);
  }

  async deleteMany(filter: Filter<T>): Promise<DeleteResult> {
    return this.collection.deleteMany(filter);
  }

  async exists(filter: Filter<T>): Promise<boolean> {
    const count = await this.collection.countDocuments(filter, { limit: 1 });
    return count > 0;
  }
}