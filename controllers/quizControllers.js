import { db } from "../fbConfig.js";

export const getQuizzes = async (req, res) => {
  try {
    const snap = await db.collection("quizzes").get();
    const allQuizzes = snap.docs.map((snapShot) => {
      return { ...snapShot.data().questions, uniqueId: snapShot.id };
    });
    return res.status(200).json(allQuizzes);
  } catch (err) {
    return res.status(404).json({ message: "Not found" });
  }
};

export const getAnswers = async (req, res) => {
  try {
    console.log("answer try")
    const answers = await db.doc(`quizzes/${req.params.id}`).get();
    return res.status(200).json(answers.data().answers);
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Server error" });
  }
};
