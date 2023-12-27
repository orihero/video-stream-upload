import { Router } from "express";
import authRoute from "./auth";
import userRoute from "./user";
import authenticate from "@middlewares/authenticate";

const router = Router();

router.use("/auth", authRoute);
router.use("/user", authenticate, userRoute);

export default router;
