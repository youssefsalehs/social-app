import {
  Model,
  QueryFilter,
  Types,
  QueryOptions,
  HydratedDocument,
  DeleteResult,
} from "mongoose";

export abstract class AbstractRepository<T> {
  constructor(private readonly model: Model<T>) {}
  async create(data: Partial<T>): Promise<HydratedDocument<T> | null> {
    return this.model.create(data);
  }
  async update(
    filter: QueryFilter<T>,
    newData: Partial<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOneAndUpdate(filter, newData, options);
  }
  async delete(filter: QueryFilter<T>): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }
  async getOne(filter: QueryFilter<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findById(filter);
  }
}
