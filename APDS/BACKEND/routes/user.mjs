import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/conn.mjs";
import ExpressBrute from "express-brute";

const router = express.Router();
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

// Register new customer
router.post("/signup", async (req, res) => {
    const { name, id_number, account_number, password } = req.body;

    // Validate inputs
    if (!/^[a-zA-Z\s]+$/.test(name) || !/^\d{13}$/.test(id_number) || !/^\d{10}$/.test(account_number)) {
        return res.status(400).json({ message: "Invalid input format" });
    }

    // Hash and salt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = {
        name,
        id_number,
        account_number,
        password: hashedPassword  // Store the hashed password
    };

    const collection = await db.collection("users");
    await collection.insertOne(newCustomer);
    res.status(201).json({ message: "Customer registered successfully" });
});

router.post("/login", async (req, res) => {
    const { name, account_number, password } = req.body;

    console.log("Login attempt received for:", { name, account_number });

    // Fetch the user based on name and account number
    const collection = await db.collection("users");
    const customer = await collection.findOne({ name, account_number });

    if (!customer) {
        console.log("User not found for", { name, account_number });
        return res.status(401).json({ message: "Authentication failed: User not found" });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, customer.password);
    if (!passwordMatch) {
        console.log("Password mismatch for user", name);
        return res.status(401).json({ message: "Authentication failed: Incorrect password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ name, account_number }, "supersecret", { expiresIn: "1h" });
    console.log("Login successful for user", name);
    res.status(200).json({ message: "Login successful", token });
});

export default router;