import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as carsController from "../controllers/cars.controller.js";
import * as notesController from "../controllers/notes.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", carsController.getCars);
router.get("/:id", carsController.getCar);
router.post("/", carsController.createCar);
router.put("/:id", carsController.updateCar);
router.delete("/:id", carsController.deleteCar);

router.get("/:id/notes", notesController.getNotes);
router.post("/:id/notes", notesController.createNote);
router.delete("/:id/notes/:noteId", notesController.deleteNote);

export default router;
