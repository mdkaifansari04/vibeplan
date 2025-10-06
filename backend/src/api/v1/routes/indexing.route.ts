import { Router, RequestHandler } from "express";
import IndexingController from "../controller/indexing.controller";
import { indexingRouteValidation } from "../../../validation/indexing-route.validation";

const router = Router();

router.post("/index", indexingRouteValidation, IndexingController.indexCodeRepository);

export default router;
