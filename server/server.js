import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";
import { auth } from "./middlewares/auth.js";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

await connectCloudinary();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Server is Live !");
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/ai", aiRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

const distPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
}

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error.message);
  if (res.headersSent) return next(error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
});
