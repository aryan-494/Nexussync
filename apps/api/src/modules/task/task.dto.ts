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
   CREATE TASK DTO
-------------------------------------------------- */

export const CreateTaskDTO = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(1, "Title must be at least 1 character")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  priority: TaskPriorityEnum,
});

/* --------------------------------------------------
   UPDATE TASK DTO
-------------------------------------------------- */

export const UpdateTaskDTO = z
  .object({
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
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided for update",
    }
  );