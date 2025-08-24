import express from "express";
import cors from "cors";
import users from "./routes/userRoutes.js"
import quiz from "./routes/quizRoutes.js"
import adminQuiz from "./routes/adminQuizRoutes.js"
import { register } from "./controllers/userControllers.js";

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
app.post("/api/register", register);
app.use("/api/user", users)
app.use("/api/quiz", quiz)
app.use("/api/add_quiz", adminQuiz)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
