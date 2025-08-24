import express, { Router } from "express"
import { adminMiddleware, authMiddleware } from "../middleware/authMiddleware.js"
import { addMultipleQuizzes, addSingleQuiz } from "../controllers/quizControllersAdmin.js";

const router = express.Router()
router.use(authMiddleware, adminMiddleware)

router.post("/single", addSingleQuiz);
router.post("/multiple", addMultipleQuizzes);

export default router