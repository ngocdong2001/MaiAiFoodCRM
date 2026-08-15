import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { StaffController } from "../controllers/staff.controller";

const router = Router();

router.use(authMiddleware);

router.get("/specialties", StaffController.getSpecialties);
router.get("/", StaffController.getAll);
router.get("/:id", StaffController.getById);
router.post("/", StaffController.create);
router.put("/:id", StaffController.update);
router.delete("/:id", StaffController.delete);

export default router;