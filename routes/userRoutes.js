import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getUser, resetResult,  updateUser } from "../controllers/userControllers.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/getuser", getUser);
router.post("/update", updateUser);
router.post("/reset", resetResult);

export default router;
