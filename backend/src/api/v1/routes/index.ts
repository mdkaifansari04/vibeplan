import { Router } from "express";
import indexingRoute from "./indexing.route";
import phaseGenerationRoute from "./phase-generation.route";
import planRoute from "./plan.routes";

const router = Router();
router.use("/indexing", indexingRoute);
router.use("/phases", phaseGenerationRoute);
router.use("/plan", planRoute);
export default router;
