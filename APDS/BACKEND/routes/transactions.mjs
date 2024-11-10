import express from "express";
import db from "../db/conn.mjs";
import checkauth from "../check_auth.mjs";  // Ensure only authenticated users can make payments
import { ObjectId } from "mongodb";

const router = express.Router();

// Make a payment
router.post("/pay", checkauth, async (req, res) => {
    console.log("Received payment request:", req.body);

    const { amount, currency, provider, account_info, swift_code } = req.body;

    // Input validation using RegEx
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
        console.log("Invalid amount:", amount);
        return res.status(400).json({ message: "Invalid amount format" });
    }

    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift_code)) {
        console.log("Invalid SWIFT code:", swift_code);
        return res.status(400).json({ message: "Invalid SWIFT code format" });
    }

    const newTransaction = {
        user: req.user.name,  // Extracted from JWT
        amount,
        currency,
        provider,
        account_info,
        swift_code,
        status: "pending"
    };

    try {
        const collection = await db.collection("transactions");
        const result = await collection.insertOne(newTransaction);
        console.log("Payment successful:", result);
        res.status(201).json({ message: "Payment successful", transaction: result });
    } catch (error) {
        console.error("Payment processing error:", error);
        res.status(500).json({ message: "Error processing payment" });
    }
});

// Get all transactions for employees to review
router.get("/transactions", checkauth, async (req, res) => {
    const collection = await db.collection("transactions");
    const transactions = await collection.find({ status: "pending" }).toArray();
    res.status(200).json(transactions);
});

// Employee verifies a transaction
router.patch("/verify/:id", checkauth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const collection = await db.collection("transactions");

    try {
        console.log(`Updating transaction ${id} with status ${status}`);  // Log the transaction ID and new status

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },  // Ensure ObjectId conversion
            { $set: { status: status } }
        );

        if (result.modifiedCount === 0) {
            console.log("Transaction not found or no modification was made");
            return res.status(404).json({ message: "Transaction not found or not updated" });
        }

        res.status(200).json({ message: `Transaction ${status}` });
    } catch (error) {
    
        console.error("Transaction update error:", error);  // Log the actual error
        res.status(500).json({ message: "Error updating transaction status" });
    }
});

export default router;