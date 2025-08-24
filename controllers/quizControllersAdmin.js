import { db } from "../fbConfig.js";

export const addSingleQuiz = async (req, res) => {
  try {
    const quizData = {
      questions: req.body.questions,
      answers: req.body.answers,
    };
    await db.collection("quizzes").add(quizData);
    return res.status(201).json({ message: "Quiz added successsfully" });
  } catch (err) {
    return res.status(400).json({ message: "Quiz was not added" });
  }
};

export const addMultipleQuizzes = async (req, res) => {
  try {
    req.body.questions.forEach(async (question, index) => {
      const quizData = {
        questions: question,
        answers: req.body.answers[index],
      };
      await db.collection("quizzes").add(quizData);
    });
    return res.status(201).json({ message: "Quiz added successsfully" });
  } catch (err) {
    return res.status(400).json({ message: "Quiz was not added" });
  }
};
