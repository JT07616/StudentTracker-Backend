import { body } from "express-validator";

export const validacijaZahtjeva = [
  body("naslov").trim().notEmpty().withMessage("Upišite naslov zahtjeva").isLength({ max: 100 }).withMessage("Naslov može imati najviše 100 znakova"),
  body("opis").optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage("Opis može imati najviše 300 znakova"),
];

export const validacijaKontakta = [
  body("kontakt").optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage("Kontakt može imati najviše 100 znakova"),
];
