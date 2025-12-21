export function buildUserEmbeddingText(user: any) {
  return `
    Skills: ${(user.skills || []).join(", ")}
    Preferred Roles: ${(user.preferred_roles || []).join(", ")}
    Location: ${(user.location).join(", ") || ""}
  `.replace(/\s+/g, " ")
    .trim();
}