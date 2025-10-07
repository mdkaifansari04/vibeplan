import { Router } from "express";
import indexingRoute from "./indexing.route";
import phaseGenerationRoute from "./phase-generation.route";

const router = Router();
router.use("/indexing", indexingRoute);
router.use("/phases", phaseGenerationRoute);

export default router;
