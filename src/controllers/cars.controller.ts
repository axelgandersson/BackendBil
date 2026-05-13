import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authenticate.js";
import * as carsService from "../services/cars.service.js";
import { AppError } from "../lib/errors.js";
import type { CarStatus } from "../generated/prisma/enums.js";

const carSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1886).max(new Date().getFullYear() + 1),
  askingPrice: z.number().positive().optional(),
  mileage: z.number().int().nonnegative().optional(),
  regNumber: z.string().optional(),
  url: z.url().optional(),
  status: z.enum(["WATCHING", "INTERESTED", "CONTACTED", "PASSED"]).optional(),
});

const VALID_STATUSES = ["WATCHING", "INTERESTED", "CONTACTED", "PASSED"];

export async function getCars(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    if (status && !VALID_STATUSES.includes(status as string)) {
      throw new AppError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    const cars = await carsService.getAllCars(req.userId!, status as CarStatus | undefined);
    res.json(cars);
  } catch (err) {
    next(err);
  }
}

export async function getCar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const car = await carsService.getCarById(req.userId!, Number(req.params.id));
    res.json(car);
  } catch (err) {
    next(err);
  }
}

export async function createCar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = carSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    const car = await carsService.createCar(req.userId!, parsed.data);
    res.status(201).json(car);
  } catch (err) {
    next(err);
  }
}

export async function updateCar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = carSchema.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    const car = await carsService.updateCar(req.userId!, Number(req.params.id), parsed.data);
    res.json(car);
  } catch (err) {
    next(err);
  }
}

export async function deleteCar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await carsService.deleteCar(req.userId!, Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
