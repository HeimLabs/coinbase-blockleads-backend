import { Router } from "express";
import { errorHandler, healthCheck, notFound } from "../controllers";
import formRouter from "./form.routes";

const router = Router();

router.get("/", healthCheck);

router.use("/form", formRouter);

router.all("*", notFound);

router.use(errorHandler);

export default router;
