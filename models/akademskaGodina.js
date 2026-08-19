import mongoose from "mongoose";

const godinaSchema = new mongoose.Schema(
  {
    korisnikId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,},
    redniBroj: { type: Number, required: true, min: 1, max: 6 },
    akademskaGodina: { type: String, trim: true, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("AkademskaGodina", godinaSchema, "akademskeGodine");
