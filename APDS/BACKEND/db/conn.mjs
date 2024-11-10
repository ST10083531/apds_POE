import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.Atlas_URI || "";  // Ensure the URI is correct
const client = new MongoClient(connectionString);

let conn;
try {
    conn = await client.connect();
    console.log('MongoDB is CONNECTED!!!');
} catch (e) {
    console.error("MongoDB connection error:", e);
}

const db = client.db("APDS7311");
export default db;