export const analysisPrompt = (resumeText: string) => {
    return `
Resume Content:
${resumeText}

Analyze the resume above.
Return a valid JSON object with this exact structure. 
Do NOT copy text from examples. Use the actual resume content.

{
    "overallScore": <number_0_to_100>,
    "strengths": [
        "<strength_1_specific_to_this_candidate>",
        "<strength_2_specific_to_this_candidate>",
        "<strength_3_specific_to_this_candidate>"
    ],
    "weaknesses": [
        "<weakness_1_constructive_feedback>",
        "<weakness_2_constructive_feedback>",
        "<weakness_3_constructive_feedback>"
    ],
    "suggestions": [
        "<actionable_tip_1>",
        "<actionable_tip_2>",
        "<actionable_tip_3>"
    ],
    "skills": ["<skill_1>", "<skill_2>", "<skill_3>", "<...extract_up_to_10_skills>"],
    "experience": {
        "yearsOfExperience": "<estimated_years_string>",
        "level": "<Intern_or_Junior_or_Mid_or_Senior>",
        "industries": ["<industry_1>", "<industry_2>"]
    },
    "formatting": {
        "score": <number_1_to_10>,
        "issues": ["<formatting_issue_1>", "<formatting_issue_2>"]
    },
    "additionalInsights": {
        "strongestArea": "<short_description>",
        "improvementPriority": "<short_description>",
        "careerReadiness": "<short_description>",
        "missingElements": ["<element_1>", "<element_2>"]
    }
}
`;
}