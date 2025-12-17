import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectToDb from './utils/db.js'
import route from './routes/index.routes'
import bullBoardRouter from './queue/bullBoard.js'
import jobEmbeddingWorker from './service/embeddingWorker.service.js'


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
connectToDb();

app.use('/', route);
app.get('/health', (req, res) => {
    res.status(200).json({ message: "zend is running fine" });
});
app.use('/queue', bullBoardRouter);

app.listen(3000, () => {
    console.log(`Server is running on ${process.env.PORT}`);
});