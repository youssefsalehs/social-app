import {
  DeleteResult,
  HydratedDocument,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  SortOrder,
  UpdateQuery,
} from "mongoose";
export interface FindManyOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortOrder>;
  populate?: PopulateOptions | PopulateOptions[];
}
export abstract class AbstractRepository<T> {
  constructor(private readonly model: Model<T>) {}
  async create(data: Partial<T>): Promise<HydratedDocument<T> | null> {
    return this.model.create(data);
  }
  async update(
    filter: QueryFilter<T>,
    newData: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOneAndUpdate(filter, newData, options);
  }
  async delete(filter: QueryFilter<T>): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }
  async getOne(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    populate?: PopulateOptions | PopulateOptions[] | string,
  ): Promise<HydratedDocument<T> | null> {
    const query = this.model.findOne(filter, projection);
    if (populate) {
      query.populate(populate as any);
    }
    return query;
  }

  async getMany(filter: QueryFilter<T>, options: FindManyOptions = {}) {
    const query = this.model.find(filter);

    if (options.sort) {
      query.sort(options.sort);
    }

    if (options.skip !== undefined) {
      query.skip(options.skip);
    }

    if (options.limit !== undefined) {
      query.limit(options.limit);
    }

    if (options.populate) {
      query.populate(options.populate as PopulateOptions | PopulateOptions[]);
    }

    return query.exec();
  }
  async count(filter: QueryFilter<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }
}
