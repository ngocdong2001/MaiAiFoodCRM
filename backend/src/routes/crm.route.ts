import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { requireManagement } from "../middleware/require-role.middleware";
import { CRMController } from "../controllers/crm.controller";

const router = Router();

router.use(authMiddleware);

router.get("/tags", CRMController.getTags);
router.get("/guests", CRMController.getAll);
// IMPORTANT: /by-phone/:id must come BEFORE /:id to avoid route conflicts
router.get("/guests/by-phone/:phone", CRMController.getByPhone);
router.get("/guests/:id", CRMController.getById);
router.post("/guests", requireManagement, CRMController.create);
router.put("/guests/:id", requireManagement, CRMController.update);
router.put("/guests/:id/notes", requireManagement, CRMController.updateNotes);
router.delete("/guests/:id", requireManagement, CRMController.delete);

export default router;
