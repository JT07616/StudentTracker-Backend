import express from "express";
import cors from "cors";
import { connectToDatabase } from "./db.js";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = 3000;

await connectToDatabase();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => res.send("StudentTracker API radi!"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
