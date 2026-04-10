import { IdempotencyModel } from "./idempotency.model";

class IdempotencyService {

  async ensureIdempotent(
    opId: string,
    userId: string,
    workspaceId: string
  ): Promise<boolean> {

    // STEP 1: Check if already processed
    const exists = await IdempotencyModel.findOne({ opId });

    if (exists) {
      return false; // duplicate
    }

    try {
      // STEP 2: Mark as processed
      await IdempotencyModel.create({
        opId,
        userId,
        workspaceId,
      });

      return true;

    } catch (err: any) {

      // 🔥 handles race condition
      if (err.code === 11000) {
        return false; // duplicate inserted by another request
      }

      throw err;
    }
  }
}

export const idempotencyService = new IdempotencyService();