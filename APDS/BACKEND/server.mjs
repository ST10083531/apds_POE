import https from "https";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import express from "express";
import cors from "cors";
import users from "./routes/user.mjs";
import db from "./db/conn.mjs";
import bcrypt from "bcrypt";
import transactions from "./routes/transactions.mjs";
import employees from "./routes/employee.mjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Manually define __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const app = express();

// SSL for HTTPS
let options;
try {
    options = {
        key: fs.readFileSync(path.resolve(__dirname, 'keys/privatekey.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'keys/certificate.pem'))
    };
    console.log('SSL certificates loaded successfully.');
} catch (error) {
    console.error('Error loading SSL certificates:', error);
    process.exit(1);  // Exit the process if SSL certificates fail to load
}

// Middleware to enable CORS and parse JSON bodies
app.use(cors({
    origin: "http://localhost:3000",  // Allow requests from frontend
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true
}));
app.use(express.json());
app.use("/transaction", transactions);
// Use the user routes for /user endpoints
app.use("/user", users);

// Insert pre-registered employee accounts (only once)
async function insertPreRegisteredAccounts() {
    const collection = await db.collection("users");

    // Log message for debugging
    console.log("Checking if pre-registered employees exist...");

    const existingUser = await collection.findOne({ name: "ST10083531" });
    if (!existingUser) {
        console.log("No pre-registered employees found. Inserting now...");

        const preRegisteredAccounts = [
            { name: "ST10083531", password: await bcrypt.hash("Legends69", 10), role: "employee" },
            { name: "ST10034279", password: await bcrypt.hash("Legends69", 10), role: "employee" },
            { name: "ST10201101", password: await bcrypt.hash("Legends69", 10), role: "employee" },
            { name: "Jarod", password: await bcrypt.hash("Jarod123!", 10), role: "employee" },
            { name: "Tyla", password: await bcrypt.hash("Tyla123!", 10), role: "employee" },
            { name: "Gabe", password: await bcrypt.hash("Gabe123!", 10), role: "employee" }
        ];

        await collection.insertMany(preRegisteredAccounts);
        console.log("Pre-registered accounts inserted.");
    } else {
        console.log("Employees are already in the database.");
    }
}
app.use("/employee", employees);

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));  // Limit requests to 100 per 15 minutes

insertPreRegisteredAccounts().catch(console.error);

// Start the server with HTTPS
https.createServer(options, app).listen(PORT, (err) => {
    if (err) {
        console.error("Server failed to start:", err);
    } else {
        console.log(`Server running on https://localhost:${PORT}`);
    }
});