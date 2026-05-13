import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import type { CarStatus } from "../generated/prisma/enums.js";

export async function getAllCars(userId: number, status?: CarStatus) {
  return prisma.car.findMany({
    where: { userId, ...(status ? { status } : {}) },
    include: { _count: { select: { notes: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCarById(userId: number, carId: number) {
  const car = await prisma.car.findFirst({
    where: { id: carId, userId },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
  if (!car) throw new AppError(404, "Car not found");
  return car;
}

export async function createCar(
  userId: number,
  data: {
    make: string;
    model: string;
    year: number;
    askingPrice?: number;
    mileage?: number;
    regNumber?: string;
    url?: string;
    status?: CarStatus;
  }
) {
  return prisma.car.create({ data: { ...data, userId } });
}

export async function updateCar(
  userId: number,
  carId: number,
  data: Partial<{
    make: string;
    model: string;
    year: number;
    askingPrice: number;
    mileage: number;
    regNumber: string;
    url: string;
    status: CarStatus;
  }>
) {
  const car = await prisma.car.findFirst({ where: { id: carId, userId } });
  if (!car) throw new AppError(404, "Car not found");

  return prisma.car.update({ where: { id: carId }, data });
}

export async function deleteCar(userId: number, carId: number) {
  const car = await prisma.car.findFirst({ where: { id: carId, userId } });
  if (!car) throw new AppError(404, "Car not found");

  await prisma.car.delete({ where: { id: carId } });
}
