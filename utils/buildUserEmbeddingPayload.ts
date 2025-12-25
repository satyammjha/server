export function buildUserEmbeddingText({
  preferences,
  resume,
}: {
  preferences?: any;
  resume?: any;
}) {
  const parts: string[] = [];
  if (preferences) {

    if (preferences.merged_skills) {
      parts.push(
        `Skills: ${preferences.merged_skills.join(", ")}`
      );
    }

    if (preferences.preferred_roles?.length) {
      parts.push(
        `Preferred Roles: ${preferences.preferred_roles.join(", ")}`
      );
    }

    if (preferences.location?.length) {
      parts.push(`Preferred Location: ${preferences.location.join(", ")}`);
    }
  }

  if (resume) {

    if (resume.experience?.yearsOfExperience) {
      parts.push(
        `Experience: ${resume.experience.yearsOfExperience} years`
      );
    }

    if (resume.experience?.industries?.length) {
      parts.push(
        `Industries: ${resume.experience.industries.join(", ")}`
      );
    }

    if (resume.strengths?.length) {
      parts.push(`Strengths: ${resume.strengths.join(", ")}`);
    }

    if (resume.additionalInsights?.careerReadiness) {
      parts.push(
        `Career Readiness: ${resume.additionalInsights.careerReadiness}`
      );
    }
  }

  return parts.join(" | ");
}