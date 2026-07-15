import { verifyJWT } from "../auth.js";

// Autorizacijski middleware - čuva zaštićene rute
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Nedostaje autorizacijski token" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = await verifyJWT(token);
  if (!decoded) {
    return res.status(401).json({ message: "Nevaljan ili istekao token" });
  }
  req.korisnik = decoded; // payload: { id, email, username }
  next();
};

export { authMiddleware };
