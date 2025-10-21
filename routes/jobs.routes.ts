import express from 'express';
import { getAllJobs, deleteSavedJobs, getSavedJobs, saveJob, updateJobStatus } from '../controller/saveJob.controller';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.get('/', getAllJobs);
router.post('/save', authMiddleware, saveJob);
router.get('/saved', authMiddleware, getSavedJobs);
router.post('/unsave', authMiddleware, deleteSavedJobs);
router.post('/update', authMiddleware, updateJobStatus);

export default router;