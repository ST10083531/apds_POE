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

        // Destructure validated and sanitized data
        const { amount, currency, provider, account_info, swift_code } = req.body;

        // Define a new payment transaction object using sanitized data
        const newPayment = {
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
            const result = await collection.insertOne(newPayment);
            res.status(201).json({ message: "Payment successful", transaction: result });
        } catch (error) {
            console.error("Error inserting transaction:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

export default router;