import express from "express";
import User from "../models/user.js";
import { generateJWT } from "../jwt.js";
import { validacijaRegistracije, validacijaLogina, validacijaPromjeneLozinke } from "../validators/authValidator.js";
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
    if (!korisnik) {
      return res.status(401).json({ message: "Korisnik ne postoji" });
    }
    return res.status(200).json(korisnik);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dohvaćanju profila" });
  }
});

router.patch("/lozinka", authMiddleware, validacijaPromjeneLozinke, obradaGresaka, async (req, res) => {
  try {
    const { staraLozinka, novaLozinka } = req.body;

    const korisnik = await User.findById(req.korisnik.id);
    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    const podudaranje = await korisnik.provjeriLozinku(staraLozinka);
    if (!podudaranje) {
      return res.status(401).json({ message: "Stara lozinka nije točna" });
    }
    korisnik.password = novaLozinka;

    await korisnik.save(); 

    return res.status(200).json({ message: "Lozinka promijenjena" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri promjeni lozinke" });
  }
});

// zeli li korisnik biti vidljiv na ljestvici ucenja
router.patch("/ljestvica", authMiddleware, async (req, res) => {
  try {
    const { showOnLeaderboard } = req.body;

    if (typeof showOnLeaderboard !== "boolean") {
      return res.status(400).json({ message: "Vrijednost mora biti true ili false" });
    }

    const korisnik = await User.findById(req.korisnik.id);
    if (!korisnik) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    korisnik.showOnLeaderboard = showOnLeaderboard;
    await korisnik.save();

    return res.status(200).json({ message: "Postavka spremljena" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri spremanju postavke" });
  }
});


export default router;
