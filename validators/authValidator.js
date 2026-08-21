import { body } from "express-validator";

export const validacijaRegistracije = [
  body("username")
    .trim().isLength({ min: 3, max: 21 }).withMessage("Korisničko ime mora imati između 3 i 21 znak")
    .isAlphanumeric().withMessage("Korisničko ime smije sadržavati samo slova i brojeve"),
  body("email").isEmail().withMessage("Upišite ispravan email"),
  body("password")
    .isLength({ min: 8 }).withMessage("Lozinka mora imati barem 8 znakova")
    .custom((value) => /[A-Za-z]/.test(value) && /\d/.test(value)).withMessage("Lozinka mora sadržavati barem jedno slovo i jedan broj"),
];

export const validacijaLogina = [
  body("email").notEmpty().withMessage("Upišite email"),
  body("password").notEmpty().withMessage("Upišite lozinku"),
];

export const validacijaPromjeneLozinke = [
  body("staraLozinka").notEmpty().withMessage("Upišite staru lozinku"),
  body("novaLozinka")
    .isLength({ min: 8 }).withMessage("Nova lozinka mora imati barem 8 znakova")
    .custom((value) => /[A-Za-z]/.test(value) && /\d/.test(value)).withMessage("Nova lozinka mora sadržavati barem jedno slovo i jedan broj"),
];