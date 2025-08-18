import express from "express";
import admin from "firebase-admin";
import cors from "cors";
import serviceAccount from "./serviceAccount.js";
import { adminMiddleware, authMiddleware } from "./middleWare.js";

// process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
const adminEmails = JSON.parse(process.env.ADMIN_EMAILS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();
// db.settings({
//   host: "127.0.0.1:8080",
//   ssl: false,
// });

const app = express();
app.use(express.json());
// app.use(cors({ origin: true }));
app.use(
  cors({
    origin: "https://maxquizzes.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/api/getuser", authMiddleware, async (req, res) => {
  try {
    const userData = await db.doc(`users/${req.user.uid}`).get();
    return res.status(200).json({ ...userData.data(), userId: req.user.uid });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

app.post("/api/update_user", authMiddleware, async (req, res) => {
  try {
    const updatedInfo = req.body;
    await auth.updateUser(req.user.uid, {
      displayName: updatedInfo.displayName,
      email: updatedInfo.email,
    });
    await db.doc(`users/${req.user.uid}`).update(updatedInfo);
    return res.status(201).json({ message: "Account update successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Update unsuccessful, please try again later" });
  }
});

app.post("/api/reset_results_data", authMiddleware, async (req, res) => {
  try {
    await db.doc(`users/${req.user.uid}`).update({ quizzesTaken: [] });
    return res.status(201).json({ message: "Reset successful" });
  } catch (err) {
    return res.status(500).json({ message: "Reset unsuccesssful" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const registryData = {
      displayName: req.body.name,
      email: req.body.email,
      password: req.body.password,
      quizzesTaken: [],
    };
    const user = await auth.createUser(registryData);
    await db.doc(`users/${user.uid}`).set({
      displayName: req.body.name,
      email: req.body.email,
      quizzesTaken: [],
    });
    if (adminEmails.includes(req.body.email)) {
      auth.setCustomUserClaims(user.uid, { admin: true });
      await db.doc(`users/${user.uid}`).update({ admin: true });
    }
    return res.status(201).json({ message: "Account successfully created" });
  } catch (err) {
    console.error("Firebase Admin createUser error:", err);
    return res.status(409).json({ code: err.code, message: err.message });
  }
});

app.get("/api/quizzes", async (req, res) => {
  try {
    const snap = await db.collection("quizzes").get();
    const allQuizzes = snap.docs.map((snapShot) => {
      return { ...snapShot.data().questions, uniqueId: snapShot.id };
    });
    return res.status(200).json(allQuizzes);
  } catch (err) {
    return res.status(404).json({ message: "Not found" });
  }
});

app.post(
  "/api/add_quizzes_single",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
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
  }
);

app.post(
  "/api/add_quizzes_multiple",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
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
  }
);

app.post("/api/quiz_answers", async (req, res) => {
  try {
    const answers = await db.doc(`quizzes/${req.body.quizId}`).get();
    return res.status(200).json(answers.data().answers);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
