import mongoose from "mongoose";

const sesijaSchema = new mongoose.Schema(
  {
    korisnikId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kolegijId: { type: mongoose.Schema.Types.ObjectId, ref: "Kolegij", default: null }, 
    pocetak: { type: Date, required: true },
    kraj: { type: Date, required: true },
    trajanjeMin: { type: Number, required: true, min: 1 }, 
  },
  { timestamps: true },
);

export default mongoose.model("Sesija", sesijaSchema, "sesije");
