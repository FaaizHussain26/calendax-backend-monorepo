import { Brackets, Repository, WhereExpressionBuilder } from "typeorm";
import { PaginationRequest } from "../interfaces/pagination-request.interface";
import { applyRelations } from "./apply-relations.service";

export class PaginationService {
  private readonly defaultSkip = 0;
  private readonly defaultOrder: Record<string, string> = {};
  private readonly maxAllowedSize = 20;

  async getPaginatedDataWithCount<T>(
    repository: Repository<T>,
    relations: string[],
    pagination: PaginationRequest,
    whereConditions?: (qb: WhereExpressionBuilder) => void,
  ): Promise<[entities: T[], totalCount: number]> {
    const {
      skip = this.defaultSkip,
      limit: take,
      params: { order, search } = {},
    } = pagination;

    const adjustedLimit =
      take === undefined || take === null
        ? undefined
        : Math.min(take, this.maxAllowedSize);

    let query = repository.createQueryBuilder("entity");
    if (adjustedLimit !== undefined) {
      query.skip(skip).take(adjustedLimit);
    }

    query = applyRelations(query, relations);

    if (whereConditions) {
      query.andWhere(whereConditions);
    }

    if (search) {
      const searchObject =
        typeof search === "string" ? JSON.parse(search) : search;
      let searchFields = searchObject.searchFields?.length
        ? searchObject.searchFields
        : this.getAllSearchableFields(repository);
      if (typeof searchFields == "string") {
        searchFields = [searchFields];
      }
      if (searchObject.searchText && searchFields.length > 0) {
        query.andWhere(
          new Brackets((qb) => {
            // Use Brackets here!
            searchFields.forEach((field, index) => {
              const paramName = `searchText${index}`;

              if (field.includes(".")) {
                // Split the field path
                const [relationName, columnName] = field.split(".");

                // Match the alias pattern from applyRelations: entity_relationName
                const aliasName = `entity_${relationName}`;

                qb.orWhere(
                  `CAST(${aliasName}.${columnName} AS TEXT) ILIKE :${paramName}`,
                  { [paramName]: `%${searchObject.searchText}%` },
                );
              } else {
                // For entity fields, prefix with 'entity.'
                qb.orWhere(
                  `CAST(entity.${String(field)} AS TEXT) ILIKE :${paramName}`,
                  { [paramName]: `%${searchObject.searchText}%` },
                );
              }
            });
          }),
        );
      }
    }

    if (order) {
      const orderObject: Record<string, string> = JSON.parse(order);

      if (Object.keys(orderObject).length > 0) {
        Object.entries(orderObject).forEach(([field, sortOrder]) => {
          let columnPath = "";

          if(field.includes(".")) {
            const [relation, column] = field.split(".");
            const alias = `entity_${relation}`;
            columnPath = `${alias}.${column}`;
          }else {
            columnPath = `entity.${field}`;
          }
          query.addOrderBy(
            columnPath,
            sortOrder.toUpperCase() as "ASC" | "DESC"
          );
        });
      } else {
        // Apply default ordering if no order is provided
        Object.entries(this.defaultOrder).forEach(([field, sortOrder]) => {
          query.addOrderBy(
            `entity.${String(field)}`,
            sortOrder.toUpperCase() as "ASC" | "DESC",
          );
        });
      }
    }

    return query.getManyAndCount();
  }

  private getAllSearchableFields<T>(repository: Repository<T>): string[] {
    const metadata = repository.metadata;

    return metadata.columns
      .filter(
        (column) =>
          column.type === "varchar" ||
          column.type === String ||
          column.type === Number ||
          column.type === "timestamp" ||
          column.type === "time" ||
          column.type === "bool" ||
          column.type === "boolean" ||
          column.type === "date",
      )
      .map((column) => column.propertyName);
  }
}
