import express from "express";
import Obveza from "../models/obveza.js";
import Kolegij from "../models/kolegij.js";
import { validacijaObveze, validacijaGotovo } from "../validators/obvezeValidator.js";
import { obradaGresaka } from "../middleware/obradaGresaka.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const obveze = await Obveza.find({ korisnikId: req.korisnik.id }).sort({rok: 1});
    return res.status(200).json(obveze);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dohvaćanju obveza" });
  }
});

router.post("/", authMiddleware, validacijaObveze, obradaGresaka, async (req, res) => {
  try {
    const { naziv, kolegijId, rok } = req.body;

    if (kolegijId) {
      const kolegij = await Kolegij.findOne({ _id: kolegijId, korisnikId: req.korisnik.id });
      if (!kolegij) {
        return res.status(404).json({ message: "Kolegij nije pronađen" });
      }

      if (kolegij.status === "polozen") {
        return res.status(409).json({ message: "Kolegij je položen, na njega se ne mogu dodavati obveze" });
      }
    }

    const obveza = await Obveza.create({
      korisnikId: req.korisnik.id,
      kolegijId: kolegijId || null,
      naziv,
      rok,
    });
    return res.status(201).json(obveza);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri spremanju obveze" });
  }
});

// kvačica: označi gotovo / nije
router.patch("/:id", authMiddleware, validacijaGotovo, obradaGresaka, async (req, res) => {
  try {
    const obveza = await Obveza.findById(req.params.id);
    
    if (!obveza || obveza.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Obveza nije pronađena" });
    }

    obveza.gotovo = req.body.gotovo;
    await obveza.save();

    return res.status(200).json(obveza);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri promjeni statusa obveze" });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const obveza = await Obveza.findById(req.params.id);
    if (!obveza || obveza.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Obveza nije pronađena" });
    }
    await obveza.deleteOne();
    return res.status(200).json({ message: "Obveza obrisana" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri brisanju obveze" });
  }
});
export default router;
