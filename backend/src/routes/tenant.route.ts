import { Router } from "express";
import {
  createTenant,
  listTenants,
  getTenant,
  updateTenant,
  deleteTenant,
  getDatabaseInfo,
} from "../controllers/tenant.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// All admin tenant routes require authentication
router.use(authMiddleware);

router.post("/", createTenant);
router.get("/", listTenants);
router.get("/:id", getTenant);
router.get("/:id/database-info", getDatabaseInfo);
router.patch("/:id", updateTenant);
router.delete("/:id", deleteTenant);

export default router;
