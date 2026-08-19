import express from "express";
import User from "../models/user.js";
import { generateJWT } from "../auth.js";
import { validacijaRegistracije, validacijaLogina} from "../validators/authValidator.js";
import { obradaGresaka } from "../middleware/obradaGresaka.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", validacijaRegistracije, obradaGresaka, async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const emailPostoji = await User.findOne({ email });

      if (emailPostoji) {
        return res.status(409).json({ message: "Korisnik s tim emailom već postoji" });
      }

      const usernamePostoji = await User.findOne({ username });

      if (usernamePostoji) {
        return res.status(409).json({ message: "Korisničko ime je zauzeto" });
      }

      const korisnik = await User.create({ username, email, password });

      const token = generateJWT({
        id: korisnik._id,
        email: korisnik.email,
        username: korisnik.username,
      });

      return res.status(201).json({
        message: "Uspješna registracija",
        jwt_token: token,
        korisnik: {
          id: korisnik._id,
          username: korisnik.username,
          email: korisnik.email,
        },
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Greška pri registraciji" });
    }
  },
);

router.post("/login", validacijaLogina, obradaGresaka, async (req, res) => {
  try {
    const { email, password } = req.body;

    const korisnik = await User.findOne({ email });
    if (!korisnik) {
      return res.status(401).json({ message: "Pogrešan email ili lozinka" });
    }

    const podudaranje = await korisnik.provjeriLozinku(password);

    if (!podudaranje) {
      return res.status(401).json({ message: "Pogrešan email ili lozinka" });
    }

    const token = generateJWT({id: korisnik._id, email: korisnik.email, username: korisnik.username});
    
    return res.status(200).json({
      message: "Uspješna prijava",
      jwt_token: token,
      korisnik: {
        id: korisnik._id,
        username: korisnik.username,
        email: korisnik.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri prijavi" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const korisnik = await User.findById(req.korisnik.id).select("-password");
    return res.status(200).json(korisnik);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dohvaćanju profila" });
  }
});


export default router;
