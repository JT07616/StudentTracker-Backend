import { body } from "express-validator";

// za KOLEGIJ (dodavanje i uređivanje)
export const validacijaKolegija = [
  body("naziv").trim().notEmpty().withMessage("Upišite naziv kolegija").isLength({ max: 100 }).withMessage("Naziv može imati najviše 100 znakova"),
  body("ects").isInt({ min: 1, max: 60 }).withMessage("ECTS mora biti broj između 1 i 60"),
  body("semestar").isInt({ min: 1, max: 12 }).withMessage("Semestar mora biti između 1 i 12"),
  body("status").isIn(["upisan", "polozen"]).withMessage("Status mora biti 'upisan' ili 'polozen'"),
  body("ocjena").optional({ nullable: true }).isInt({ min: 2, max: 5 }).withMessage("Ocjena mora biti između 2 i 5"),
  body("ocjena").custom((ocjena, { req }) => {
    if (req.body.status === "polozen" && !ocjena) {
      throw new Error("Položen kolegij mora imati ocjenu");
    }
    if (req.body.status === "upisan" && ocjena) {
      throw new Error("Upisan kolegij ne može imati ocjenu");
    }
    return true;
  }),
  body("ispitniRok").optional({ nullable: true }).isISO8601().withMessage("Ispitni rok mora biti ispravan datum"),
  body("godinaId").isMongoId().withMessage("Neispravna godina"),
];
