import { auth, db } from "../fbConfig.js";

const adminEmails = process.env.ADMIN_EMAILS

export const register = async (req, res) => {
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
};

export const getUser = async (req, res) => {
  try {
    const userData = await db.doc(`users/${req.user.uid}`).get();
    return res.status(200).json({ ...userData.data(), userId: req.user.uid });
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
};

export const updateUser = async (req, res) => {
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
};

export const resetResult = async (req, res) => {
  try {
    await db.doc(`users/${req.user.uid}`).update({ quizzesTaken: [] });
    return res.status(201).json({ message: "Reset successful" });
  } catch (err) {
    return res.status(500).json({ message: "Reset unsuccesssful" });
  }
};
