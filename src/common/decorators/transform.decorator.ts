import { Transform } from 'class-transformer';

// handles arrays sent via multipart form data
// Postman sends siteIds[0], siteIds[1] which comes as string or string[]
export function TransformArray() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  });
}

// handles boolean fields sent via multipart form data
// form data sends 'true'/'false' as strings
export function TransformBoolean() {
  return Transform(({ value }) => value === 'true' || value === true);
}

// handles number fields sent via multipart form data
export function TransformNumber() {
  return Transform(({ value }) => (value !== undefined ? Number(value) : undefined));
}