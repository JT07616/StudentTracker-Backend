import mongoose from "mongoose";

const kolegijSchema = new mongoose.Schema(
  {
    korisnikId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    godinaId: { type: mongoose.Schema.Types.ObjectId, ref: "AkademskaGodina", required: true },
    naziv: { type: String, required: true, trim: true, maxlength: 100 },
    ects: { type: Number, required: true, min: 1, max: 60 },
    semestar: { type: Number, required: true, min: 1, max: 12 },
    status: { type: String, enum: ["upisan", "polozen"], default: "upisan" },
    ocjena: { type: Number, min: 2, max: 5, default: null },
    ispitniRok: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Kolegij", kolegijSchema, "kolegiji");
  