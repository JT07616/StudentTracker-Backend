import { body } from "express-validator";

export const validacijaObveze = [
  body("naziv").trim().notEmpty().withMessage("Upišite naziv obveze").isLength({ max: 100 }).withMessage("Naziv može imati najviše 100 znakova"),
  body("kolegijId").isMongoId().withMessage("Neispravan kolegij"),
  body("rok").optional({ nullable: true }).isISO8601().withMessage("Rok mora biti ispravan datum"),
];

// za PATCH kvačicu (gotovo true/false)
export const validacijaGotovo = [
  body("gotovo").isBoolean().withMessage("Gotovo mora biti true ili false"),
];
