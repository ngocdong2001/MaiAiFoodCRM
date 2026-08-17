import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { ServiceController } from "../controllers/service.controller";

const router = Router();

router.use(authMiddleware);

router.get("/categories", ServiceController.getCategories);
router.post("/categories", ServiceController.createCategory);
router.put("/categories/:id", ServiceController.updateCategory);
router.delete("/categories/:id", ServiceController.deleteCategory);

router.get("/", ServiceController.getAll);
router.post("/", ServiceController.create);
router.put("/bulk", ServiceController.bulkSave);
router.get("/:id", ServiceController.getById);
router.put("/:id", ServiceController.update);
router.patch("/:id/active", ServiceController.toggleActive);
router.delete("/:id", ServiceController.delete);

export default router;
