import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authenticate.js";
import * as notesService from "../services/notes.service.js";
import { AppError } from "../lib/errors.js";

const noteSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
});

export async function getNotes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notes = await notesService.getNotes(req.userId!, Number(req.params.id));
    res.json(notes);
  } catch (err) {
    next(err);
  }
}

export async function createNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    const note = await notesService.createNote(
      req.userId!,
      Number(req.params.id),
      parsed.data.content
    );
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await notesService.deleteNote(
      req.userId!,
      Number(req.params.id),
      Number(req.params.noteId)
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
