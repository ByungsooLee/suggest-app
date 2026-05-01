import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;
  const { id: movieId } = await params;

  const [count, myLike] = await Promise.all([
    prisma.movieLike.count({ where: { movieId } }),
    prisma.movieLike.findUnique({
      where: { userId_movieId: { userId, movieId } },
      select: { id: true },
    }),
  ]);

  return Response.json({ count, liked: myLike !== null });
}

export async function POST(_req: Request, { params }: Params) {
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

  await prisma.movieLike.upsert({
    where:  { userId_movieId: { userId, movieId } },
    create: { userId, movieId },
    update: {},
  });

  const count = await prisma.movieLike.count({ where: { movieId } });
  return Response.json({ count, liked: true }, { status: 200 });
}

export async function DELETE(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;
  const { id: movieId } = await params;

  await prisma.movieLike.deleteMany({ where: { userId, movieId } });

  const count = await prisma.movieLike.count({ where: { movieId } });
  return Response.json({ count, liked: false }, { status: 200 });
}
