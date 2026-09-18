import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { requireManagement } from "../middleware/require-role.middleware";
import { ServiceController } from "../controllers/service.controller";

const router = Router();

router.use(authMiddleware);

router.get("/categories", ServiceController.getCategories);
router.post("/categories", requireManagement, ServiceController.createCategory);
router.put(
  "/categories/:id",
  requireManagement,
  ServiceController.updateCategory,
);
router.delete(
  "/categories/:id",
  requireManagement,
  ServiceController.deleteCategory,
);

router.get("/", ServiceController.getAll);
router.post("/", requireManagement, ServiceController.create);
router.put("/bulk", requireManagement, ServiceController.bulkSave);
router.get("/:id", ServiceController.getById);
router.put("/:id", requireManagement, ServiceController.update);
router.patch("/:id/active", requireManagement, ServiceController.toggleActive);
router.delete("/:id", requireManagement, ServiceController.delete);

export default router;
