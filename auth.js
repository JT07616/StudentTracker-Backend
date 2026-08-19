import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET mora biti definiran u .env datoteci");
}

const generateJWT = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
  } catch (err) {
    console.error(`Greška prilikom generiranja JWT tokena: ${err}`);
    return null;
  }
};

const verifyJWT = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error(`Greška prilikom verifikacije JWT tokena: ${err}`);
    return null;
  }
};

export { generateJWT, verifyJWT };
