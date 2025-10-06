import { Router } from "express";

import indexingRoute from "./indexing.route";

const router = Router();

router.use("/indexing", indexingRoute);

export default router;
