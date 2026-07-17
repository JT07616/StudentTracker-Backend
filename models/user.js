import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true},
    password: { type: String, required: true },
    emailReminders: { type: Boolean, default: true },
    showOnLeaderboard: { type: Boolean, default: true },
    brojSemestara: { type: Number, min: 1, max: 12, default: 6 }, // trajanje studija - odreduje raspon semestara u aplikaciji
  },
  { timestamps: true },
);

// hashiraj lozinku prije spremanja (samo kad je nova ili promijenjena)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// usporedba upisane lozinke s hashom iz baze (koristi se kod prijave)
userSchema.methods.provjeriLozinku = function (lozinka) {
  return bcrypt.compare(lozinka, this.password);
};

export default mongoose.model("User", userSchema);
