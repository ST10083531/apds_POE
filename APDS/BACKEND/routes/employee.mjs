import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/conn.mjs";

const router = express.Router();

// Employee login
router.post("/login", async (req, res) => {
    const { name, password } = req.body;

    const collection = await db.collection("users");
    const employee = await collection.findOne({ name, role: "employee" }); // Only allows employees to login

    if (!employee) {
        return res.status(401).json({ message: "Authentication failed: Employee not found" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
        return res.status(401).json({ message: "Authentication failed: Incorrect password" });
    }

    // Generate a JWT token for employee
    const token = jwt.sign({ name, role: "employee" }, "supersecret", { expiresIn: "1h" });
    res.status(200).json({ message: "Employee login successful", token });
});

export default router;