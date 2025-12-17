import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
    {
        job_id: { type: String, required: true, index: true },
        job_title: { type: String, required: true },
        company_name: { type: String },
        company_id: { type: Number },
        company_logo: { type: String },

        locations: [{ type: String }],
        location_string: { type: String },

        description: { type: String },
        skills: [{ type: String }],
        industries: [{ type: String }],
        functions: [{ type: String }],

        min_experience_years: { type: Number, default: 0 },
        max_experience_years: { type: Number, default: 0 },
        experience_range: { type: String },

        min_salary: { type: Number, default: 0 },
        max_salary: { type: Number, default: 0 },
        salary_currency: { type: String, default: "INR" },
        salary_confidential: { type: Boolean, default: false },
        hide_salary: { type: Number, default: 0 },

        job_types: [{ type: String }],
        employment_types: [{ type: String }],
        job_classification: { type: String },

        apply_url: { type: String, required: true },

        posted_at: { type: Date },
        created_at: { type: Date },
        updated_at: { type: Date },
        closed_at: { type: Date },
        freshness: { type: Date },

        total_applicants: { type: Number, default: 0 },
        is_urgent: { type: Boolean, default: false },
        is_active: { type: Boolean, default: true },
        quick_apply: { type: Boolean, default: false },

        reference_code: { type: String },
        job_source: { type: String, default: "SCRAPPING" },

        recruiter_name: { type: String },
        recruiter_id: { type: Number },
        channel_name: { type: String },
        site_context: { type: String },


        is_bold: { type: Boolean, default: false },
        is_jd_logo: { type: Boolean, default: false },
        is_search_logo: { type: Boolean, default: false },
        hide_company_name: { type: Boolean, default: false },

        scraped_at: { type: Date },

        source_platform: { type: String },
        tags: [{ type: String }],
        is_verified: { type: Boolean, default: false },

        is_embedded: { type: Boolean, default: false, required: false },
        embedding_queued: { type: Boolean, default: false, required: false },
        embedded_at: { type: Date, required: false },
    },
    {
        timestamps: true,
    }
);

JobSchema.index({ job_title: "text", company_name: "text", skills: "text" });
JobSchema.index({ is_active: 1, location_string: 1 });
JobSchema.index({ job_source: 1 });

const JobModel = mongoose.model("Job", JobSchema);
export default JobModel;