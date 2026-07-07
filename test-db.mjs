// test-db.mjs
import mongoose from "mongoose";
import { config } from "dotenv";

config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
console.log("URI:", uri);

try {
    await mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Conexión exitosa!");
    await mongoose.disconnect();
} catch (e) {
    console.error("❌ Error:", e.message);
}
