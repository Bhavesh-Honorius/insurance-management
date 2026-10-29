require("dotenv").config({ override: true });

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { connectDB, getDB, closeDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Sample insurance policies (same plans the frontend shows)
const samplePlans = [
    { id: 1, name: "Essential Health", category: "Health", icon: "♡", price: 499, coverage: "Up to ₹5 Lakhs",
      description: "A sample health insurance plan designed to help with eligible medical and hospitalization expenses.",
      benefits: ["Sample hospitalization coverage", "Medical expense protection", "Hospital stay benefits"] },
    { id: 2, name: "Family Health Plus", category: "Health", icon: "✚", price: 999, coverage: "Up to ₹10 Lakhs",
      description: "A sample family health plan intended to demonstrate coverage options for family members.",
      benefits: ["Family coverage options", "Sample hospitalization benefits", "Medical expense protection"] },
    { id: 3, name: "Two-Wheeler Protect", category: "Vehicle", icon: "⌁", price: 299, coverage: "Plan-dependent",
      description: "A sample insurance plan for two-wheelers, illustrating vehicle protection and policy selection.",
      benefits: ["Vehicle protection options", "Sample third-party coverage", "Policy details for comparison"] },
    { id: 4, name: "Car Secure", category: "Vehicle", icon: "🚘", price: 799, coverage: "Plan-dependent",
      description: "A sample car insurance plan to demonstrate vehicle insurance features and policy comparisons.",
      benefits: ["Vehicle protection options", "Sample accident-related coverage", "Policy details for comparison"] },
    { id: 5, name: "Life Protection", category: "Life", icon: "♡", price: 699, coverage: "Up to ₹25 Lakhs",
      description: "A sample life insurance plan illustrating how life protection options can be displayed online.",
      benefits: ["Sample life cover", "Family financial protection", "Policy information for comparison"] },
    { id: 6, name: "Family Future", category: "Life", icon: "♧", price: 1299, coverage: "Up to ₹50 Lakhs",
      description: "A sample life insurance plan intended to demonstrate long-term family protection options.",
      benefits: ["Sample life cover", "Long-term protection options", "Family financial planning"] }
];

// Upsert by id so an old/mismatched collection gets corrected too
async function seedPolicies() {
    const db = getDB();
    const policies = db.collection("policies");

    await policies.createIndex({ id: 1 }, { unique: true });

    const result = await policies.bulkWrite(
        samplePlans.map(plan => ({
            replaceOne: { filter: { id: plan.id }, replacement: plan, upsert: true }
        }))
    );

    // users <-> policies link: one document per user = that user's chosen plan
    await db.collection("user_policies").createIndex({ userId: 1 }, { unique: true });

    const total = await policies.countDocuments();
    console.log(`Seeding -> db: ${db.databaseName}, upserted: ${result.upsertedCount}, modified: ${result.modifiedCount}, total plans: ${total}`);
}

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Insurance Policy Management API is running."
    });
});

// Get all insurance policies
app.get("/api/policies", async (req, res) => {
    try {
        const policies = await getDB()
            .collection("policies")
            .find({}, { projection: { _id: 0 } })
            .sort({ id: 1 })
            .toArray();

        res.json({
            success: true,
            count: policies.length,
            policies
        });
    } catch (error) {
        console.error("Get policies error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve insurance policies."
        });
    }
});

// Register a user
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide your name, email and password."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 100 characters."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 72 characters."
            });
        }

        const db = getDB();
        const users = db.collection("users");

        const existingUser = await users.findOne({ email: cleanEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await users.insertOne({
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully. Please log in.",
            user: {
                id: result.insertedId,
                name: cleanName,
                email: cleanEmail
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        console.error("Registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
});

// Log in a user
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email and password."
            });
        }

        const db = getDB();
        const user = await db.collection("users").findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from .env");
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
                issuer: "insurecare"
            }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});

// ---------- Auth middleware ----------
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: "Please log in first." });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: "insurecare" });
        req.userId = new ObjectId(payload.userId);
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }
}

// ---------- users <-> policies relationship ----------
// Collection "user_policies": { userId -> users._id, policyId -> policies.id, selectedAt }

// Get the logged-in user's selected plan (joined with the policies collection)
app.get("/api/my-policy", requireAuth, async (req, res) => {
    try {
        const [link] = await getDB().collection("user_policies").aggregate([
            { $match: { userId: req.userId } },
            { $lookup: { from: "policies", localField: "policyId", foreignField: "id", as: "policy" } },
            { $unwind: "$policy" },
            { $project: { _id: 0, selectedAt: 1, "policy._id": 0 } }
        ]).toArray();

        res.json({ success: true, selection: link || null });
    } catch (error) {
        console.error("Get my-policy error:", error.message);
        res.status(500).json({ success: false, message: "Unable to load your plan." });
    }
});

// Select (or change) the logged-in user's plan
app.put("/api/my-policy", requireAuth, async (req, res) => {
    try {
        const policyId = Number((req.body || {}).policyId);
        const db = getDB();

        if (!Number.isInteger(policyId) || !(await db.collection("policies").findOne({ id: policyId }))) {
            return res.status(404).json({ success: false, message: "Insurance plan not found." });
        }

        await db.collection("user_policies").updateOne(
            { userId: req.userId },
            { $set: { policyId, selectedAt: new Date() } },
            { upsert: true }
        );

        res.json({ success: true, message: "Plan saved to your account.", policyId });
    } catch (error) {
        console.error("Save my-policy error:", error.message);
        res.status(500).json({ success: false, message: "Unable to save your plan." });
    }
});

// Remove the logged-in user's plan
app.delete("/api/my-policy", requireAuth, async (req, res) => {
    try {
        await getDB().collection("user_policies").deleteOne({ userId: req.userId });
        res.json({ success: true, message: "Plan removed." });
    } catch (error) {
        console.error("Delete my-policy error:", error.message);
        res.status(500).json({ success: false, message: "Unable to remove your plan." });
    }
});

// Unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Bad JSON / unexpected errors -> JSON, not HTML
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({ success: false, message: "Invalid JSON in request body." });
    }
    console.error("Unhandled error:", err.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
});

// Start server only after connecting to MongoDB
async function startServer() {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from .env");
        }
        await connectDB();
        await seedPolicies();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Policies API: http://localhost:${PORT}/api/policies`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        await closeDB().catch(() => {});
        process.exitCode = 1;
    }
}

process.on("SIGINT", async () => {
    await closeDB();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await closeDB();
    process.exit(0);
});

startServer();