import { type ZodSchema } from "zod";

export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: Response.json(
        {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
        { status: 400 },
      ),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json(
        {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: parsed.error.flatten(),
        },
        { status: 422 },
      ),
    };
  }

  return { ok: true, data: parsed.data };
}
