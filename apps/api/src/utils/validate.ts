import { ZodSchema, ZodError } from "zod";
import { HttpError } from "../errors";

export function validateDTO<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];

      // Map field to error code
      const field = firstIssue.path[0];

      let code = "VALIDATION_ERROR";

      switch (field) {
        case "title":
          code = "INVALID_TITLE";
          break;

        case "description":
          code = "INVALID_DESCRIPTION";
          break;

        case "priority":
          code = "INVALID_PRIORITY";
          break;

        case "status":
          code = "INVALID_STATUS";
          break;

        case "assignedTo":
          code = "INVALID_ASSIGNMENT";
          break;
      }

      throw new HttpError(
        firstIssue.message,
        400,
        code
      );
    }

    throw err;
  }
}