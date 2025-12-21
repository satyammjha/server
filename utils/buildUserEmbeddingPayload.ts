export function buildUserEmbeddingText(user: any) {
  return `
    Role: ${user.current_role || ""}
    Skills: ${(user.skills || []).join(", ")}
    Experience: ${user.experience || ""}
    Preferred Roles: ${(user.preferred_roles || []).join(", ")}
    Location: ${user.location || ""}
    Resume Summary: ${user.resume_summary || ""}
  `
    .replace(/\s+/g, " ")
    .trim();
}