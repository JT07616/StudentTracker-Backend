import { validationResult } from "express-validator";

// Skupi validacijske greške iz lanaca; ako ih ima -> vrati 400, inače nastavi
export const obradaGresaka = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
