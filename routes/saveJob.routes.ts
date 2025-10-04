import express from 'express';
import { deleteSavedJobs, getSavedJobs, saveJob } from '../controller/saveJob.controller';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.post('/save',authMiddleware, saveJob);
router.get('/saved',authMiddleware, getSavedJobs);
router.post('/unsave',authMiddleware, deleteSavedJobs);

export default router;