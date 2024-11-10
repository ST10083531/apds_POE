import express from "express";
import db from "../db/conn.mjs";
import checkauth from "../check_auth.mjs";

const router = express.Router();

// Get all transactions
router.get("/", async (req, res) => {
    const collection = await db.collection("transactions");
    const results = await collection.find({}).toArray();
    res.send(results).status(200);
});

// Create new payment transaction
router.post("/pay", checkauth, async (req, res) => {
    const { amount, currency, provider, account_info, swift_code } = req.body;

    // Input validation using RegEx
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
        return res.status(400).json({ message: "Invalid amount format" });
    }

    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift_code)) {
        return res.status(400).json({ message: "Invalid SWIFT code format" });
    }

    const newPayment = {
        user: req.user.name,  // Assumes that user info is extracted from JWT
        amount,
        currency,
        provider,
        account_info,
        swift_code,
        status: "pending"
    };

    const collection = await db.collection("transactions");
    const result = await collection.insertOne(newPayment);
    res.status(201).json({ message: "Payment successful", transaction: result });
});

export default router;