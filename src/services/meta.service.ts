import prisma from "../lib/prisma.js";

export async function getStats(userId: number) {
  const [statusGroups, priceStats, mileageStats] = await Promise.all([
    prisma.car.groupBy({
      by: ["status"],
      where: { userId },
      _count: { id: true },
    }),
    prisma.car.aggregate({
      where: { userId, askingPrice: { not: null } },
      _avg: { askingPrice: true },
      _min: { askingPrice: true },
      _max: { askingPrice: true },
    }),
    prisma.car.aggregate({
      where: { userId, mileage: { not: null } },
      _avg: { mileage: true },
    }),
  ]);

  return {
    byStatus: statusGroups.map((g) => ({
      status: g.status,
      count: g._count.id,
    })),
    price: {
      avg: priceStats._avg.askingPrice,
      min: priceStats._min.askingPrice,
      max: priceStats._max.askingPrice,
    },
    mileage: {
      avg: mileageStats._avg.mileage,
    },
  };
}

export async function getSummary(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      _count: { select: { cars: true } },
    },
  });

  if (!user) return null;

  const noteCount = await prisma.note.count({
    where: { car: { userId } },
  });

  return {
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    carCount: user._count.cars,
    noteCount,
  };
}
