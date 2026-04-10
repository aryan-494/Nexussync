import { z } from "zod";

/* --------------------------------------------------
   ENUMS
-------------------------------------------------- */

export const TaskStatusEnum = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
]);

export const TaskPriorityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
]);

/* --------------------------------------------------
   COMMON FIELDS
-------------------------------------------------- */

// ✅ Zod v4 compatible (no required_error)
const OpIdField = z
  .string()
  .min(1, "Operation ID (opId) is required")
  .uuid("Invalid opId format");

/* --------------------------------------------------
   CREATE TASK DTO
-------------------------------------------------- */

export const CreateTaskDTO = z.object({

  opId: OpIdField, // 🔥 required for idempotency

  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid task id"),

  title: z
    .string()
    .min(1, "Title must be at least 1 character")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  priority: TaskPriorityEnum.optional(),

});

/* --------------------------------------------------
   UPDATE TASK DTO
-------------------------------------------------- */

export const UpdateTaskDTO = z
  .object({

    opId: OpIdField, // 🔥 required for idempotency

    title: z
      .string()
      .min(1, "Title must be at least 1 character")
      .max(200, "Title cannot exceed 200 characters")
      .optional(),

    description: z
      .string()
      .max(5000, "Description cannot exceed 5000 characters")
      .optional(),

    status: TaskStatusEnum.optional(),

    priority: TaskPriorityEnum.optional(),

    assignedTo: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Assigned user must be valid ObjectId")
      .nullable()
      .optional(),

  })
  .refine(
    (data) => {
      const { opId, ...rest } = data;
      return Object.keys(rest).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    }
  );