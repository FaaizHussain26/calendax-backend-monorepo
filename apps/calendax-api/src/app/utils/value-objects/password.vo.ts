import { z } from 'zod';

const AtLeastOneLowerLetterRegex = /(?=.*[a-z])/;
const AtLeastOneUpperLetterRegex = /(?=.*[A-Z])/;
const AtLeastOneDigitRegex = /\d/;

export const PlainPasswordSchema = z.string()
  .refine((value) => value.length >= 8, {
    message: 'Password should contain at least 8 characters',
  })
  .refine((value) => AtLeastOneLowerLetterRegex.test(value), {
    message: 'Password should contain at least one lower letter',
  })
  .refine((value) => AtLeastOneUpperLetterRegex.test(value), {
    message: 'Password should contain at least one upper letter',
  })
  .refine((value) => AtLeastOneDigitRegex.test(value), {
    message: 'Password should contain at least one digit',
  });

export const HashedPasswordSchema = z.string();

export type PlainPassword = z.infer<typeof PlainPasswordSchema> & { _brand: 'PlainPassword' };
export type HashedPassword = z.infer<typeof HashedPasswordSchema>;
