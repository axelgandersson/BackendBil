import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as metaController from "../controllers/meta.controller.js";

const router = Router();

router.use(authenticate);

router.get("/stats", metaController.getStats);
router.get("/summary", metaController.getSummary);

export default router;
