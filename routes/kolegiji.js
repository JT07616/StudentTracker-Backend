import express from "express";
import Kolegij from "../models/kolegij.js";
import AkademskaGodina from "../models/akademskaGodina.js";
import Obveza from "../models/obveza.js";
import Sesija from "../models/sesija.js";
import { validacijaKolegija } from "../validators/kolegijiValidator.js";
import { obradaGresaka } from "../middleware/obradaGresaka.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();


router.get("/", authMiddleware, async (req, res) => {
  try {
    const kolegiji = await Kolegij.find({ korisnikId: req.korisnik.id }).sort({createdAt: -1,});
    return res.status(200).json(kolegiji);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška prilikom dohvaćanja kolegija" });
  }
});

router.post("/", authMiddleware,  validacijaKolegija, obradaGresaka, async (req, res) => {
    try {
      const { naziv, ects, godinaId, semestar, status, ocjena, ispitniRok } = req.body;
      const godina = await AkademskaGodina.findOne({_id: godinaId, korisnikId: req.korisnik.id});
      if (!godina) {
        return res.status(404).json({ message: "Godina nije pronađena" });
      }
      // semestar mora pripadati toj godini (npr. semestar 5 -> 3. godina)
      if (Math.ceil(semestar / 2) !== godina.redniBroj) {
        return res.status(400).json({ message: "Semestar ne pripada toj godini" });
      }

      const postoji = await Kolegij.findOne({ korisnikId: req.korisnik.id, semestar, naziv });

      if (postoji) {
        return res.status(409).json({ message: "U ovom semestru već postoji kolegij s tim nazivom" });
      }

      const kolegij = await Kolegij.create({
        korisnikId: req.korisnik.id,
        godinaId,
        naziv,
        ects,
        semestar,
        status,
        ocjena,
        ispitniRok,
      });
      return res.status(201).json(kolegij);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Greška prilikom spremanja kolegija" });
    }
  },
);

router.put("/:id", authMiddleware, validacijaKolegija, obradaGresaka, async (req, res) => {
  try {
    const { naziv, ects, godinaId, semestar, status, ocjena, ispitniRok } = req.body;

    const kolegij = await Kolegij.findById(req.params.id);
    if (!kolegij || kolegij.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Kolegij nije pronađen" });
    }

    const godina = await AkademskaGodina.findOne({ _id: godinaId, korisnikId: req.korisnik.id });
    if (!godina) {
      return res.status(404).json({ message: "Godina nije pronađena" });
    }

    if (Math.ceil(semestar / 2) !== godina.redniBroj) {
      return res.status(400).json({ message: "Semestar ne pripada toj godini" });
    }

    const postoji = await Kolegij.findOne({ korisnikId: req.korisnik.id, semestar, naziv, _id: { $ne: kolegij._id } });
    
    if (postoji) {
      return res.status(409).json({ message: "U ovom semestru već postoji kolegij s tim nazivom" });
    }

    Object.assign(kolegij, { naziv, ects, godinaId, semestar, status, ocjena, ispitniRok });

    await kolegij.save();

    return res.status(200).json(kolegij);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška prilikom uređivanja kolegija" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const kolegij = await Kolegij.findById(req.params.id);

    if (!kolegij || kolegij.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Kolegij nije pronađen" });
    }

    // s kolegijem brisemo i sve njegove obveze
    await Obveza.deleteMany({ kolegijId: kolegij._id });
    // sesije ne brisemo nego odvezujemo - vrijeme ucenja ostaje zabiljezeno kao "Bez kolegija"
    await Sesija.updateMany({ kolegijId: kolegij._id }, { kolegijId: null });
    await kolegij.deleteOne();
    
    return res.status(200).json({ message: "Kolegij obrisan" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška prilikom brisanja kolegija" });
  }
});

export default router;
