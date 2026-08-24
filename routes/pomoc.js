import express from "express";
import ZahtjevPomoc from "../models/zahtjevPomoc.js";
import { authMiddleware } from "../middleware/auth.js";
import { validacijaZahtjeva, validacijaKontakta } from "../validators/pomocValidator.js";
import { obradaGresaka } from "../middleware/obradaGresaka.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const zahtjevi = await ZahtjevPomoc.find({$or: [{ status: "otvoren" }, { korisnikId: req.korisnik.id }, { pomagacId: req.korisnik.id }]}).populate("korisnikId", "username").populate("pomagacId", "username email").sort({ createdAt: -1 });

    const rezultat = zahtjevi.map((zahtjev) => {
      const zapis = {
        _id: zahtjev._id,
        naslov: zahtjev.naslov,
        opis: zahtjev.opis,
        status: zahtjev.status,
        createdAt: zahtjev.createdAt,
        autorId: zahtjev.korisnikId._id,
        autorUsername: zahtjev.korisnikId.username,
        pomagacId: zahtjev.pomagacId?._id || null,
        pomagacUsername: zahtjev.pomagacId?.username || null,
        kontakt: null,
      };
      // kontakt ide samo autoru, a pomagac ga ostavlja pri prihvacanju, a autorov kontakt se ne dijeli da se prihvacanjem ne mogu skupljati emailovi
      if (zahtjev.status !== "otvoren" && zahtjev.korisnikId._id.toString() === req.korisnik.id) {
        zapis.kontakt = zahtjev.kontaktPomagaca || zahtjev.pomagacId?.email || null; // vrati mail ako nije upisan kontakt
      }
      return zapis;
    });

    return res.status(200).json(rezultat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri dohvaćanju zahtjeva" });
  }
});

router.post("/", authMiddleware, validacijaZahtjeva, obradaGresaka, async (req, res) => {
  try {
    const { naslov, opis } = req.body; // validator ih je vec provjerio i trimao

    const zahtjev = await ZahtjevPomoc.create({
      korisnikId: req.korisnik.id,
      naslov,
      opis: opis || null,
    });

    return res.status(201).json(zahtjev);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri objavi zahtjeva" });
  }
});

router.put("/:id", authMiddleware, validacijaZahtjeva, obradaGresaka, async (req, res) => {
  try {
    const { naslov, opis } = req.body;

    const zahtjev = await ZahtjevPomoc.findById(req.params.id);
    if (!zahtjev || zahtjev.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Zahtjev nije pronađen" });
    }
    // pomagac je pristao na ovaj zahtjev pa se uvjeti ne mijenjaju naknadno
    if (zahtjev.status !== "otvoren") {
      return res.status(409).json({ message: "Zahtjev koji je netko prihvatio ne može se mijenjati" });
    }

    zahtjev.naslov = naslov;
    zahtjev.opis = opis || null;
    await zahtjev.save();

    return res.status(200).json({ message: "Zahtjev ažuriran" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri uređivanju zahtjeva" });
  }
});

router.patch("/:id/prihvati", authMiddleware, validacijaKontakta, obradaGresaka, async (req, res) => {
  try {
    const { kontakt } = req.body;

    const zahtjev = await ZahtjevPomoc.findById(req.params.id);
    if (!zahtjev) {
      return res.status(404).json({ message: "Zahtjev nije pronađen" });
    }
    if (zahtjev.korisnikId.toString() === req.korisnik.id) {
      return res.status(400).json({ message: "Ne možeš prihvatiti vlastiti zahtjev" });
    }
    if (zahtjev.status !== "otvoren") {
      return res.status(409).json({ message: "Zahtjev je već prihvaćen" });
    }

    zahtjev.pomagacId = req.korisnik.id;
    zahtjev.kontaktPomagaca = kontakt?.trim() || req.korisnik.email;
    zahtjev.status = "prihvacen";
    await zahtjev.save();

    return res.status(200).json({ message: "Zahtjev prihvaćen" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri prihvaćanju zahtjeva" });
  }
});

// autor prebacuje rijeseno <-> u tijeku (slcna stvar kao kod obaveza)
router.patch("/:id/rijesi", authMiddleware, async (req, res) => {
  try {
    const zahtjev = await ZahtjevPomoc.findById(req.params.id);
    if (!zahtjev || zahtjev.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Zahtjev nije pronađen" });
    }
    if (zahtjev.status === "otvoren") {
      return res.status(409).json({ message: "Zahtjev još nema pomagača" });
    }

    zahtjev.status = zahtjev.status === "prihvacen" ? "rijesen" : "prihvacen";
    await zahtjev.save();

    return res.status(200).json({ message: "Status promijenjen" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri označavanju" });
  }
});

// autor brise svoj zahtjev (otvoren ili rijesen a dok netko aktivno pomaze onda ne)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const zahtjev = await ZahtjevPomoc.findById(req.params.id);

    if (!zahtjev || zahtjev.korisnikId.toString() !== req.korisnik.id) {
      return res.status(404).json({ message: "Zahtjev nije pronađen" });
    }
    if (zahtjev.status === "prihvacen") {
      return res.status(409).json({ message: "Zahtjev kod kojeg netko pomaže ne može se obrisati" });
    }

    await zahtjev.deleteOne();
    return res.status(200).json({ message: "Zahtjev obrisan" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Greška pri brisanju zahtjeva" });
  }
});

export default router;
