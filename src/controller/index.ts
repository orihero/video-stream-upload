import { Router } from "express";
import authRoute from "./auth";
import userRoute from "./user";
import authenticate from "@middlewares/authenticate";
import paymentRoute from "./payment";
import { paymeCheckToken } from "@middlewares/payment";

const router = Router();

router.use("/auth", authRoute);
router.use("/user", authenticate, userRoute);
router.use("/payme", paymeCheckToken, paymentRoute);

export default router;
