import { SelectQueryBuilder } from "typeorm";

export function applyRelations<T>(
    query: SelectQueryBuilder<T>,
    relations: string[],
    alias: string = 'entity', // Alias for the main entity
  ): SelectQueryBuilder<T> {
    const joinedRelations = new Set<string>(); // Keep track of joined relations
  
    for (const relation of relations) {
      let currentAlias = alias;
      const relationParts = relation.split('.');
  
      for (let i = 0; i < relationParts.length; i++) {
        const part = relationParts[i];
        const joinAlias = `${currentAlias}_${part}`; // Create a unique alias
  
        const relationPath = i === 0 ? `${alias}.${part}` : `${currentAlias}.${part}`;
  
        // Check if this part of the relation has already been joined
        if (!joinedRelations.has(relationPath)) {
          query.leftJoinAndSelect(relationPath, joinAlias);
          joinedRelations.add(relationPath);
        }
        currentAlias = joinAlias;
      }
    }
    return query;
  }
  