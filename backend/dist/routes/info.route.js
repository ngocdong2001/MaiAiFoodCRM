"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const info_controller_1 = require("../controllers/info.controller");
const router = (0, express_1.Router)();
router.post("/", info_controller_1.InfoController.create);
router.get("/", info_controller_1.InfoController.getAll);
exports.default = router;
