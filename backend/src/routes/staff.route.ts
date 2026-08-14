import { Router } from "express";

import { StaffController } from "../controllers/staff.controller";

const router = Router();

router.get("/specialties", StaffController.getSpecialties);
router.get("/", StaffController.getAll);
router.get("/:id", StaffController.getById);
router.post("/", StaffController.create);
router.put("/:id", StaffController.update);
router.delete("/:id", StaffController.delete);

export default router;