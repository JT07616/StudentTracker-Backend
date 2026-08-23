import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import requestLogger from "./middleware/requestLogger.js";
import authRouter from "./routes/auth.js";
import akademskeGodineRouter from "./routes/akademskeGodine.js";
import kolegijiRouter from "./routes/kolegiji.js";
import obvezeRouter from "./routes/obveze.js";
import pomocRouter from "./routes/pomoc.js";
import ucenjeRouter from "./routes/ucenje.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => res.send("StudentTracker API radi!"));

app.use("/auth", authRouter);
app.use("/akademske-godine", akademskeGodineRouter);
app.use("/kolegiji", kolegijiRouter);
app.use("/obveze", obvezeRouter);
app.use("/pomoc", pomocRouter);
app.use("/ucenje", ucenjeRouter);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Uspješno spajanje na bazu podataka"))
  .catch((error) =>
    console.error("Greška pri spajanju na bazu:", error.message),
  );

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
