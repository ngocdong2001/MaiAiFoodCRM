import { Router } from "express";

import { CRMController } from "../controllers/crm.controller";

const router = Router();

router.get("/tags", CRMController.getTags);
router.get("/guests", CRMController.getAll);
router.get("/guests/:id", CRMController.getById);
router.post("/guests", CRMController.create);
router.put("/guests/:id", CRMController.update);
router.put("/guests/:id/notes", CRMController.updateNotes);
router.delete("/guests/:id", CRMController.delete);

export default router;