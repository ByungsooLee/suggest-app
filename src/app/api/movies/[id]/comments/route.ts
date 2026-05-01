import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const PostSchema = z.object({
  body: z.string().trim().min(1).max(500),
});

export async function GET(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { id: movieId } = await params;

  const comments = await prisma.movieComment.findMany({
    where: { movieId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id:        true,
      body:      true,
      createdAt: true,
      user: {
        select: {
          id:       true,
          name:     true,
          username: true,
          image:    true,
        },
      },
    },
  });

  const count = await prisma.movieComment.count({ where: { movieId } });
  return Response.json({ comments, count });
}

export async function POST(req: Request, { params }: Params) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;
  const { id: movieId } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    select: { id: true },
  });
  if (!movie) {
    return Response.json({ code: "MOVIE_NOT_FOUND" }, { status: 404 });
  }

  const body: unknown = await req.json();
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { code: "VALIDATION_ERROR", errors: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const comment = await prisma.movieComment.create({
    data: { userId, movieId, body: parsed.data.body },
    select: {
      id:        true,
      body:      true,
      createdAt: true,
      user: {
        select: {
          id:       true,
          name:     true,
          username: true,
          image:    true,
        },
      },
    },
  });

  return Response.json({ comment }, { status: 201 });
}
