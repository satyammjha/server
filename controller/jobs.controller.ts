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
        // 1. Destructure Query Parameters
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

        // 2. Build the Query Object
        // We use 'any' here for flexibility because Mongoose query objects 
        // with complex $or/$text operators can be difficult to strictly type 
        // while dynamically building them.
        const query: FilterQuery<typeof JobModel> = {
            is_active: true,
        };

        // --- SEARCH FEATURE (Full Text Search) ---
        if (search) {
            query.$text = { $search: search };
        }

        // --- FILTERS ---

        // Filter: Job Title
        if (job_title) {
            query.job_title = { $regex: job_title, $options: "i" };
        }

        // Filter: Location
        if (location) {
            query.$or = [
                { locations: { $regex: location, $options: "i" } },
                { location_string: { $regex: location, $options: "i" } }
            ];
        }

        // Filter: Job Type
        if (job_type) {
            const types = job_type.split(",");
            query.job_types = { $in: types.map((t) => new RegExp(t, "i")) };
        }

        // Filter: Experience
        if (experience) {
            const expYear = Number(experience);
            if (!isNaN(expYear)) {
                query.min_experience_years = { $lte: expYear };
                query.max_experience_years = { $gte: expYear };
            }
        }

        // Filter: Salary
        if (min_salary) {
            const salary = Number(min_salary);
            if (!isNaN(salary)) {
                query.max_salary = { $gte: salary };
                query.hide_salary = { $ne: 1 };
            }
        }

        // 3. Sorting Logic
        let sortOption: Record<string, any> = { posted_at: -1 }; // Default: Newest first

        if (sort === "oldest") {
            sortOption = { posted_at: 1 };
        } else if (sort === "salary_high") {
            sortOption = { max_salary: -1 };
        } else if (search) {
            // If searching by text, sort by relevance score
            sortOption = { score: { $meta: "textScore" } };
        }

        // 4. Pagination Logic
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // 5. Execute Queries
        const [jobs, totalJobs] = await Promise.all([
            JobModel.find(query, search ? { score: { $meta: "textScore" } } : {})
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .select("-__v"),
            JobModel.countDocuments(query),
        ]);

        // 6. Send Response
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

        // Type narrowing for error
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: errorMessage,
        });
    }
};

export default getJobsForDashboard;