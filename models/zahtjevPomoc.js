import mongoose from "mongoose";

const zahtjevPomocSchema = new mongoose.Schema(
  {
    korisnikId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // autor zahtjeva
    naslov: { type: String, required: true, trim: true, maxlength: 100 },
    opis: { type: String, trim: true, maxlength: 300, default: null },
    status: { type: String, enum: ["otvoren", "prihvacen", "rijesen"], default: "otvoren" },
    pomagacId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    kontaktPomagaca: { type: String, trim: true, maxlength: 100, default: null }, // upisuje pomagac pri prihvacanju

  },
  { timestamps: true },
);

export default mongoose.model("ZahtjevPomoc", zahtjevPomocSchema, "zahtjeviPomoc");
