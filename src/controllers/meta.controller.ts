import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authenticate.js";
import * as metaService from "../services/meta.service.js";
import { AppError } from "../lib/errors.js";

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await metaService.getStats(req.userId!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const summary = await metaService.getSummary(req.userId!);
    if (!summary) throw new AppError(404, "User not found");
    res.json(summary);
  } catch (err) {
    next(err);
  }
}
