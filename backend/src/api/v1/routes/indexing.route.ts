import { Router, RequestHandler } from "express";
import IndexingController from "../controller/indexing.controller";
import { indexingRouteValidation, searchRouteValidation } from "../../../validation/indexing-route.validation";

const router = Router();

router.post("/", indexingRouteValidation, IndexingController.indexCodeRepository);
router.post("/search", searchRouteValidation, IndexingController.searchRepository);

export default router;
