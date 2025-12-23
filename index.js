import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToDb from "./utils/db.js";
import route from "./routes/index.routes.js";
import bullBoardRouter from "./queue/bullBoard.js";
import "./service/embeddingWorker.service.js";
import "./service/userEmbedding.service.js";

dotenv.config();

const app = express();

/* ------------------ BASIC SETUP ------------------ */
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

/* ------------------ BOT + ENDPOINT LOGGER ------------------ */
const BOT_REGEX =
    /bot|crawler|spider|crawling|google|bing|duckduck|uptime|health/i;

app.use((req, res, next) => {
    // ignore noisy health check if you want
    // if (req.originalUrl === "/health") return next();

    const start = Date.now();
    const ua = req.headers["user-agent"] || "unknown";
    const isBot = BOT_REGEX.test(ua);

    res.on("finish", () => {
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ` +
            `${res.statusCode} ${Date.now() - start}ms | ` +
            `${isBot ? "BOT" : "HUMAN"} | ip=${req.ip} | ua="${ua}"`
        );
    });

    next();
});

/* ------------------ DB ------------------ */
connectToDb();

/* ------------------ ROUTES ------------------ */
app.use("/", route);

app.get("/health", (req, res) => {
    res.status(200).json({ message: "z-end is running fine" });
});

app.use("/queue", bullBoardRouter);

/* ------------------ SERVER ------------------ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
