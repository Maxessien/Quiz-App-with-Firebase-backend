import express from "express"
import { getAnswers, getQuizzes } from "../controllers/quizControllers.js";

const router = express.Router()

router.get("/questions", getQuizzes);
router.get("/answers/:id", getAnswers);

export default router