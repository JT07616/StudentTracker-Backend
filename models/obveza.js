import mongoose from "mongoose";

const obvezaSchema = new mongoose.Schema(
  {
    korisnikId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kolegijId: { type: mongoose.Schema.Types.ObjectId, ref: "Kolegij", default: null },
    naziv: { type: String, required: true, trim: true, maxlength: 100 },
    rok: { type: Date, default: null },
    gotovo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Obveza", obvezaSchema, "obveze");
