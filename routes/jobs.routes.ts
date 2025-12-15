import express from 'express';
import { getAllJobs, deleteSavedJobs, getSavedJobs, saveJob, updateJobStatus, saveJobNotes } from '../controller/saveJob.controller';
import authMiddleware from '../middleware/auth';
import getJobsForDashboard from '../controller/jobs.controller';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/dashboard', authMiddleware, getJobsForDashboard);
router.post('/save', authMiddleware, saveJob);
router.get('/saved', authMiddleware, getSavedJobs);
router.post('/unsave', authMiddleware, deleteSavedJobs);
router.post('/update', authMiddleware, updateJobStatus);
router.post('/comment', authMiddleware, saveJobNotes);
export default router;