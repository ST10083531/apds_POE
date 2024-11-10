import express from "express";
import db from "../db/conn.mjs";
import checkauth from "../check_auth.mjs";
import { ObjectId } from "mongodb";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Make a payment with validation and sanitization
router.post(
    "/pay",
    checkauth,
    [
        body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be a positive number")
            .customSanitizer(value => parseFloat(value.toFixed(2))),  // Sanitize amount to two decimal places
        body("currency").isString().isLength({ min: 3, max: 3 }).toUpperCase().withMessage("Currency must be a valid 3-letter code"),
        body("provider").isString().trim().escape().withMessage("Provider must be a string"),
        body("account_info").isString().trim().escape().withMessage("Account information must be a string"),
        body("swift_code").matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/).withMessage("Invalid SWIFT code format")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Use validated and sanitized data
        const { amount, currency, provider, account_info, swift_code } = req.body;
        const newTransaction = {
            user: req.user.name,
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
    }
);

// Get all pending transactions for employees to review
router.get("/transactions", checkauth, async (req, res) => {
    const collection = await db.collection("transactions");
    try {
        const transactions = await collection.find({ status: "pending" }).toArray();
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error retrieving transactions:", error);
        res.status(500).json({ message: "Error retrieving transactions" });
    }
});

// Employee verifies or denies a transaction
router.patch("/verify/:id", checkauth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const collection = await db.collection("transactions");

    try {
        console.log(`Updating transaction ${id} with status ${status}`);

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status } }
        );

        if (result.modifiedCount === 0) {
            console.log("Transaction not found or no modification was made");
            return res.status(404).json({ message: "Transaction not found or not updated" });
        }

        res.status(200).json({ message: `Transaction ${status}` });
    } catch (error) {
        console.error("Transaction update error:", error);
        res.status(500).json({ message: "Error updating transaction status" });
    }
});

export default router;