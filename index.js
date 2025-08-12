import express from "express";
import admin from "firebase-admin";
import cors from "cors";
import { createRequire } from "module";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

// process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

const require = createRequire(import.meta.url);

// const serviceAccount = require("./serviceAccount.json");

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
app.use(cors({ 
  origin: "https://maxquizzes.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

(async () => {
  try {
    const users = await admin.auth().listUsers(1);
    console.log(
      "Service account valid. Retrieved user count:",
      users.users.length
    );
  } catch (e) {
    console.error("Auth error:", e);
  }
})();

app.post("/api/getuser", async (req, res) => {
  try {
    const userData = await db.collection("users").doc(req.body.userId).get();
    return res
      .status(200)
      .json({ ...userData.data(), userId: req.body.userId });
    //   return res.status(200).json(userData);
  } catch (err) {
    return res.status(400).json({ message: "Invalid email and password" });
  }
});

app.post("/api/update_user", async (req, res) => {
  try {
    const updatedInfo = req.body;
    await auth.updateUser(req.body.userId, {
      displayName: updatedInfo.displayName,
      email: updatedInfo.email,
    });
    await db.doc(`users/${req.body.userId}`).update(updatedInfo);
    return res.status(201).json({ message: "Account update successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Update unsuccessful, please try again later" });
  }
});

app.post("/api/reset_results_data", async (req, res) => {
  try {
    await db.doc(`users/${req.body.userId}`).update({ quizzesTaken: [] });
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

app.post("/api/add_quizzes_single", async (req, res) => {
  try {
    const quizData = {
      questions: req.body.questions,
      answers: req.body.answers,
    };
    if (req.body.key !== "max@12354") {
      return res.status(400).json({ message: "Unauthorised access" });
    }
    await db.collection("quizzes").add(quizData);
    return res.status(201).json({ message: "Quiz added successsfully" });
  } catch (err) {
    return res.status(400).json({ message: "Quiz was not added" });
  }
});

app.post("/api/add_quizzes_multiple", async (req, res) => {
  if (req.body.key !== "max@12354") {
    return res.status(400).json({ message: "Unauthorised access" });
  }
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
});

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
