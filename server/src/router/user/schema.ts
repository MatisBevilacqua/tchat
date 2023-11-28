import { z } from "zod";
import country from "../../data/country.json";

type Required = [
  z.ZodLiteral<string>,
  z.ZodLiteral<string>,
  ...z.ZodLiteral<string>[]
];

export const countryType = z.union(
  country.map((c) => z.literal(c)) as any as Required
);

export const trimMin = z.string().trim().min(2);
export const genderType = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const user = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  surname: z.string(),
  gender: z.number(),
  country: countryType,
  state: z.string(),
  city: z.string(),
  origin: countryType,
});
