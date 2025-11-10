import type { Document, Model, FilterQuery, UpdateQuery } from "mongoose";

/**
 * Utility functions for database operations
 */

/**
 * Soft delete a document by setting deletedAt timestamp
 */
export async function softDelete<T extends Document>(
  model: Model<T>,
  id: string
): Promise<T | null> {
  return model.findByIdAndUpdate(
    id,
    { deletedAt: new Date() } as UpdateQuery<T>,
    { new: true }
  );
}

/**
 * Soft delete multiple documents
 */
export async function softDeleteMany<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>
): Promise<{ modifiedCount: number }> {
  const result = await model.updateMany(filter, {
    deletedAt: new Date(),
  } as UpdateQuery<T>);

  return { modifiedCount: result.modifiedCount };
}

/**
 * Restore a soft-deleted document
 */
export async function restore<T extends Document>(
  model: Model<T>,
  id: string
): Promise<T | null> {
  return model.findByIdAndUpdate(
    id,
    { $unset: { deletedAt: 1 } } as UpdateQuery<T>,
    { new: true }
  );
}

/**
 * Find documents excluding soft-deleted ones
 */
export function findActive<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {}
) {
  return model.find({ ...filter, deletedAt: null } as FilterQuery<T>);
}

/**
 * Find one document excluding soft-deleted ones
 */
export function findOneActive<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>
) {
  return model.findOne({ ...filter, deletedAt: null } as FilterQuery<T>);
}

/**
 * Count documents excluding soft-deleted ones
 */
export function countActive<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {}
): Promise<number> {
  return model.countDocuments({ ...filter, deletedAt: null } as FilterQuery<T>);
}

/**
 * Paginate results with soft delete support
 */
export async function paginate<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T> = {},
  options: {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    select?: string;
    populate?: string | string[];
    includeDeleted?: boolean;
  } = {}
) {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select,
    populate,
    includeDeleted = false,
  } = options;

  const skip = (page - 1) * limit;

  // Add deletedAt filter unless includeDeleted is true
  const finalFilter = includeDeleted
    ? filter
    : ({ ...filter, deletedAt: null } as FilterQuery<T>);

  const query = model.find(finalFilter).sort(sort).skip(skip).limit(limit);

  if (select) {
    query.select(select);
  }

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((p) => query.populate(p));
    } else {
      query.populate(populate);
    }
  }

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(finalFilter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Bulk upsert operation
 */
export async function bulkUpsert<T extends Document>(
  model: Model<T>,
  data: Array<{ filter: FilterQuery<T>; update: UpdateQuery<T> }>
) {
  const operations = data.map(({ filter, update }) => ({
    updateOne: {
      filter,
      update,
      upsert: true,
    },
  }));

  return model.bulkWrite(operations);
}

/**
 * Check if document exists (excluding soft-deleted)
 */
export async function exists<T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>
): Promise<boolean> {
  const count = await model.countDocuments({
    ...filter,
    deletedAt: null,
  } as FilterQuery<T>);
  return count > 0;
}

/**
 * Get document by ID with error handling
 */
export async function findByIdOrFail<T extends Document>(
  model: Model<T>,
  id: string,
  errorMessage = "Document not found"
): Promise<T> {
  const doc = await model.findOne({
    _id: id,
    deletedAt: null,
  } as FilterQuery<T>);

  if (!doc) {
    throw new Error(errorMessage);
  }

  return doc;
}