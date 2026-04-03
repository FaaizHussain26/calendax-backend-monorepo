import { NotFoundException } from '@nestjs/common';
export const entityNotFound = (
  param: unknown | unknown[] | null | undefined,
  entity: string,
  id?: string | number,
): void => {
  const isEmptyArray = Array.isArray(param) && param.length === 0;
  if (!param || isEmptyArray) {
    throw new NotFoundException(
      id ? `${entity} with ID ${id} not found` : `${entity} not found`,
    );
  }
};
