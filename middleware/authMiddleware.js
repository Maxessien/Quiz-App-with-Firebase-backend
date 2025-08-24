import { auth } from "../fbConfig.js";

export const authMiddleware = async (req, res, next) => {
  console.log("middleware", req);
  const authHeader = req.headers.authorisation || req.headers.Authorisation;
  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(404).json({ message: "Unauthorised access" });
  }
  try {
    const token = authHeader.slice(7);
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    console.log(req.user, "rewqq")
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Verification failed" });
  }
};

export const adminMiddleware = async (req, res, next) => {
  console.log(req.user, "admin")
  try {
    if (req.user.admin) {
      next();
    } else {
      return res.status(401).json({ message: "Unauthorised access" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
