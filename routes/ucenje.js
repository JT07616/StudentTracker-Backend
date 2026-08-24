import express from "express";
import Sesija from "../models/sesija.js";
import Kolegij from "../models/kolegij.js";
import User from "../models/user.js";
import { validacijaSesije } from "../validators/ucenjeValidator.js";
import { obradaGresaka } from "../middleware/obradaGresaka.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const pocetakTjedna = () => {
  const datum = new Date();
  datum.setHours(0, 0, 0, 0);
  datum.setDate(datum.getDate() - ((datum.getDay() + 6) % 7));
  return datum;
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    const sesije = await Sesija.find({ korisnikId: req.korisnik.id }).sort({ pocetak: -1 });
    return res.status(200).json(sesije);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dohvaćanju sesija" });
  }
});


router.post("/", authMiddleware, validacijaSesije, obradaGresaka, async (req, res) => {
  try {
    const { pocetak, kraj, kolegijId } = req.body;

    // trajanje se računa ovdje a ne prima s frontenda, da se ne može upisati štogod
    const trajanjeMs = new Date(kraj) - new Date(pocetak);
    if (trajanjeMs <= 0) {
      return res.status(400).json({ message: "Kraj sesije mora biti nakon početka" });
    }
    if (trajanjeMs < 60000) {
      return res.status(400).json({ message: "Sesije kraće od minute se ne spremaju" });
    }
    const trajanjeMin = Math.round(trajanjeMs / 60000);
    if (trajanjeMin > 1440) {
      return res.status(400).json({ message: "Sesija ne može trajati dulje od 24 sata" });
    }

    if (kolegijId) {
      const kolegij = await Kolegij.findOne({ _id: kolegijId, korisnikId: req.korisnik.id });
      if (!kolegij) {
        return res.status(404).json({ message: "Kolegij nije pronađen" });
      }
    }

    const sesija = await Sesija.create({
      korisnikId: req.korisnik.id,
      kolegijId: kolegijId || null,
      pocetak,
      kraj,
      trajanjeMin,
    });
    return res.status(201).json(sesija);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri spremanju sesije" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const sesija = await Sesija.findById(req.params.id);
    if (!sesija || sesija.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Sesija nije pronađena" });
    }
    await sesija.deleteOne();
    return res.status(200).json({ message: "Sesija obrisana" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri brisanju sesije" });
  }
});

// tjedna ljestvica - zbroj minuta ucenja po korisniku od pon
router.get("/ljestvica", authMiddleware, async (req, res) => {
  try {
    const [sesijeSvih, korisnici] = await Promise.all([Sesija.find({ pocetak: { $gte: pocetakTjedna() } }), User.find({ $or: [{ showOnLeaderboard: true }, { _id: req.korisnik.id }] })]);
    // za svakog korisnika zbroji njegove minute, pa poredaj i uzmi top 15
    const ljestvica = korisnici
      .map((korisnik) => ({
        username: korisnik.username,
        skriven: !korisnik.showOnLeaderboard, // moze biti true samo za mene, ostali su ionako vidljivi
        minute: sesijeSvih.filter((sesija) => sesija.korisnikId.toString() === korisnik._id.toString()).reduce((zbroj, sesija) => zbroj + sesija.trajanjeMin, 0),
      }))
      .filter((red) => red.minute > 0).sort((a, b) => b.minute - a.minute).slice(0, 15);

    return res.status(200).json(ljestvica);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dohvaćanju ljestvice" });
  }
});

export default router;
