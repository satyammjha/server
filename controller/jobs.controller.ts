import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import JobModel from "../models/Jobs.schema";

interface DashboardQueryParams {
    page?: string;
    limit?: string;
    search?: string;
    job_title?: string;
    location?: string;
    job_type?: string;
    experience?: string;
    min_salary?: string;
    sort?: string;
}

export const getJobsForDashboard = async (
    req: Request<{}, {}, {}, DashboardQueryParams>,
    res: Response
) => {
    try {
        const {
            page = "1",
            limit = "10",
            search,
            job_title,
            location,
            job_type,
            experience,
            min_salary,
            sort,
        } = req.query;

        const query: FilterQuery<typeof JobModel> = {
            is_active: true,
        };

        if (search) {
            query.$text = { $search: search };
        }

        if (job_title) {
            query.job_title = { $regex: job_title, $options: "i" };
        }

        if (location) {
            query.$or = [
                { locations: { $regex: location, $options: "i" } },
                { location_string: { $regex: location, $options: "i" } }
            ];
        }

        if (job_type) {
            const types = job_type.split(",");
            query.job_types = { $in: types.map((t) => new RegExp(t, "i")) };
        }

        if (experience) {
            const expYear = Number(experience);
            if (!isNaN(expYear)) {
                query.min_experience_years = { $lte: expYear };
                query.max_experience_years = { $gte: expYear };
            }
        }

        if (min_salary) {
            const salary = Number(min_salary);
            if (!isNaN(salary)) {
                query.max_salary = { $gte: salary };
                query.hide_salary = { $ne: 1 };
            }
        }

        let sortOption: Record<string, any> = { posted_at: -1 };

        if (sort === "oldest") {
            sortOption = { posted_at: 1 };
        } else if (sort === "salary_high") {
            sortOption = { max_salary: -1 };
        } else if (search) {
            sortOption = { score: { $meta: "textScore" } };
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const [jobs, totalJobs] = await Promise.all([
            JobModel.find(query, search ? { score: { $meta: "textScore" } } : {})
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .select("-__v"),
            JobModel.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            count: jobs.length,
            total: totalJobs,
            pagination: {
                current_page: pageNum,
                total_pages: Math.ceil(totalJobs / limitNum),
                has_next: pageNum * limitNum < totalJobs,
                has_prev: pageNum > 1,
            },
            data: jobs,
        });

    } catch (error) {
        console.error("Error in getJobsForDashboard:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: errorMessage,
        });
    }
};

export const getJobDetailsV2 = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({ message: "Job id is required" });
        }

        const job = await JobModel.findById(jobId).lean();

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        return res.status(200).json({
            job, isSaved: false,
        });

    } catch (error) {
        console.error("[getJobDetails] Error:", error);
        return res.status(500).json({
            message: "Failed to fetch job details",
        });
    }
};

export default getJobsForDashboard;