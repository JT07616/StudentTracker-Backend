import { body } from "express-validator";

export const validacijaSesije = [
  body("pocetak").isISO8601().withMessage("Početak mora biti ispravan datum"),
  body("kraj").isISO8601().withMessage("Kraj mora biti ispravan datum"),
  body("kolegijId").optional({ nullable: true }).isMongoId().withMessage("Neispravan kolegij"),
];
