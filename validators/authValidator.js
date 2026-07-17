import { body } from "express-validator";

// Pravila za REGISTRACIJU 
export const validacijaRegistracije = [
  body("username")
    .trim().isLength({ min: 3, max: 21 }).withMessage("Korisničko ime mora imati između 3 i 21 znak")
    .isAlphanumeric().withMessage("Korisničko ime smije sadržavati samo slova i brojeve"),
  body("email").isEmail().withMessage("Upišite ispravan email"),
  body("password")
    .isLength({ min: 8 }).withMessage("Lozinka mora imati barem 8 znakova")
    .custom((value) => /[A-Za-z]/.test(value) && /\d/.test(value)).withMessage("Lozinka mora sadržavati barem jedno slovo i jedan broj"),
  body("brojSemestara")
    .optional({ nullable: true }).isInt({ min: 1, max: 12 }).withMessage("Broj semestara mora biti između 1 i 12"),
];

// Pravila za PRIJAVU
export const validacijaLogina = [
  body("email").notEmpty().withMessage("Upišite email"),
  body("password").notEmpty().withMessage("Upišite lozinku"),
];