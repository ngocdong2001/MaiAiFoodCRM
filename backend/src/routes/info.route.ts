import { Router } from "express";
import { InfoController } from "../controllers/info.controller.js";

const router = Router();

router.post("/", InfoController.create);
router.get("/", InfoController.getAll);

export default router;
