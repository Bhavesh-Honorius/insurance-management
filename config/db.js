const { MongoClient } = require("mongodb");

let client;
let database;

async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is missing from the .env file.");
    }

    client = new MongoClient(uri);
    await client.connect();

    database = client.db("insurance_policy_management");

    await database.collection("users").createIndex(
        { email: 1 },
        { unique: true }
    );

    console.log("MongoDB Atlas connected successfully.");

    return database;
}

function getDB() {
    if (!database) {
        throw new Error("Database is not connected.");
    }

    return database;
}

async function closeDB() {
    if (client) {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

module.exports = { connectDB, getDB, closeDB };