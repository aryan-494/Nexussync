import { z } from "zod";

export const PaginationDTO = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => Number.isInteger(val) && val >= 1, {
      message: "Page must be a positive integer",
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => Number.isInteger(val) && val >= 1, {
      message: "Limit must be a positive integer",
    }),
});