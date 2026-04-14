import { ObjectId } from 'mongodb';

export interface BaseMongoDocument {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoInsertResult {
  insertedCount: number;
  acknowledged: boolean;
}