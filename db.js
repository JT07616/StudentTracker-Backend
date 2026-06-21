import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const mongoURI = process.env.MONGO_URI;
const db_name = process.env.DB_NAME;

if (!mongoURI || !db_name) {
  throw new Error("MONGO_URI i DB_NAME moraju biti definirani u .env datoteci");
}

const client = new MongoClient(mongoURI);
let db = null;

async function connectToDatabase() {
  if (db) return db; // već spojeno -> vrati postojeću vezu
  try {
    await client.connect();
    console.log("Uspješno spajanje na bazu podataka");
    db = client.db(db_name);
    return db;
  } catch (error) {
    console.error("Greška prilikom spajanja na bazu podataka", error);
    throw error;
  }
}

export { connectToDatabase };