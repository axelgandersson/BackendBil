import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

export async function getNotes(userId: number, carId: number) {
  const car = await prisma.car.findFirst({ where: { id: carId, userId } });
  if (!car) throw new AppError(404, "Car not found");

  return prisma.note.findMany({
    where: { carId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNote(
  userId: number,
  carId: number,
  content: string
) {
  const car = await prisma.car.findFirst({ where: { id: carId, userId } });
  if (!car) throw new AppError(404, "Car not found");

  return prisma.note.create({ data: { carId, content } });
}

export async function deleteNote(
  userId: number,
  carId: number,
  noteId: number
) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, carId, car: { userId } },
  });
  if (!note) throw new AppError(404, "Note not found");

  await prisma.note.delete({ where: { id: noteId } });
}
