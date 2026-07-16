import { z } from "zod";

/**
 * See https://github.com/colinhacks/zod/issues/63#issuecomment-1429974422
 */
export function stringNotBlank(): z.ZodString {
  return z.string().trim().min(1);
}

export function stringIsTimestampTz(): z.ZodISODateTime {
  return z.iso.datetime({ offset: true, local: false });
}

/**
 * UUID simple format (hexadecimal)
 */
export function stringIsUUID(): z.ZodString {
  return z.string().trim().min(32);
}

/**
 * nanoid() default output: 21 chars, URL-safe alphabet (A-Za-z0-9_-).
 * Used for Trainer.id, which is a nanoid rather than a UUID.
 */
export function stringIsNanoId(): z.ZodString {
  return z.string().trim().length(21);
}

/**
 * Number should be an integer, 1 or bigger
 */
export function numberIsID(): z.ZodInt {
  return z.int().min(1);
}

/**
 * Number should be an integer, 0 or bigger
 */
export function numberIsRoleID(): z.ZodInt {
  return z.int().min(0);
}

/**
 * Number should be an integer, 1 or bigger
 */
export function numberIsPosInt(): z.ZodInt {
  return z.int().min(1);
}

/**
 * Number should be an integer, 0 or bigger
 */
export function numberIsNonNegInt(): z.ZodInt {
  return z.int().min(0);
}

/**
 * Object only has one property `id` which is an ID (number)
 */
export function objectHasOnlyID() {
  return z.object({ id: numberIsID() });
}

/**
 * Object only has one property `id` which is a UUID
 */
export function objectHasOnlyUUID() {
  return z.object({ id: z.uuid() });
}

/**
 * Object only has one property `id` which is a nanoid (see stringIsNanoId)
 */
export function objectHasOnlyNanoId() {
  return z.object({ id: stringIsNanoId() });
}
