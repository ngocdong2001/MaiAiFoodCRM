import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { requireManagement } from "../middleware/require-role.middleware";
import { StaffController } from "../controllers/staff.controller";

const router = Router();

router.use(authMiddleware);

router.get("/specialties", StaffController.getSpecialties);
router.get("/", StaffController.getAll);
router.get("/:id", StaffController.getById);
router.post("/", requireManagement, StaffController.create);
router.put("/:id", requireManagement, StaffController.update);
router.delete("/:id", requireManagement, StaffController.delete);

export default router;