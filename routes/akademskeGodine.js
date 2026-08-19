import express from "express";
import AkademskaGodina from "../models/akademskaGodina.js";
import Kolegij from "../models/kolegij.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const godine = await AkademskaGodina.find({korisnikId: req.korisnik.id,}).sort({ redniBroj: 1 });
    return res.status(200).json(godine);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dohvaćanju godina" });
  }
});


router.post("/", authMiddleware, async (req, res) => {
  try {
    const { redniBroj, akademskaGodina } = req.body;

    if (!Number.isInteger(redniBroj) || redniBroj < 1 || redniBroj > 6) {
      return res.status(400).json({ message: "Akademska godina mora biti između 1 i 6" });
    }

    const postoji = await AkademskaGodina.findOne({korisnikId: req.korisnik.id, redniBroj});

    if (postoji) {
      return res.status(409).json({ message: "Ta akademska godina već postoji" });
    }

    const godina = await AkademskaGodina.create({
      korisnikId: req.korisnik.id,
      redniBroj,
      akademskaGodina,
    });
    
    return res.status(201).json(godina);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dodavanju akademske godine" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const godina = await AkademskaGodina.findOne({_id: req.params.id, korisnikId: req.korisnik.id,});
    if (!godina) {
      return res.status(404).json({ message: "Akademska godina nije pronađena" });
    }
    
    const imaKolegija = await Kolegij.findOne({ godinaId: godina._id });

    if (imaKolegija) {
      return res.status(409).json({ message: "Akademska godina ima kolegije - prvo ih obriši" });
    }

    await godina.deleteOne();

    return res.status(200).json({ message: "Akademska godina uklonjena" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri uklanjanju akademske godine" });
  }
});

export default router;
