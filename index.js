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

app.set("trust proxy", true);
app.use(express.json());
app.use(cors());


app.use((req, res, next) => {

    const start = Date.now();
    const ua = req.headers["user-agent"] || "unknown";

    res.on("finish", () => {
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ` +
            `${res.statusCode} ${Date.now() - start}ms`
        );
    });

    next();
});

connectToDb();

app.use("/", route);

app.get("/health", (req, res) => {
    res.status(200).json({ message: "z-end is running fine" });
});

app.use("/queue", bullBoardRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});