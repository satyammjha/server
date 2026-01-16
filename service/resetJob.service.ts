import JobModel from "../models/Jobs.schema";
import { SavedJobModel } from "../models/SavedJobs.model";

const clearOldJob = async () => {
    try {
        const savedJobIds = await SavedJobModel.distinct("jobId");

        const result = await JobModel.deleteMany({
            _id: { $nin: savedJobIds }
        });

        console.log(`🧹 Deleted ${result.deletedCount} unsaved jobs`);
        return result;
    } catch (error) {
        console.log("[CLEAROLDJOB]", error);
        throw error;
    }
};

export default clearOldJob;