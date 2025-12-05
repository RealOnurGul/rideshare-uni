// Allowed university email domains for signup
export const ALLOWED_DOMAINS = [
  "mcgill.ca",
  "concordia.ca",
  "umontreal.ca",
];

// Map domains to university names
export const DOMAIN_TO_UNIVERSITY: Record<string, string> = {
  "mcgill.ca": "McGill University",
  "concordia.ca": "Concordia University",
  "umontreal.ca": "Université de Montréal",
};

export function isAllowedDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

export function getUniversityFromEmail(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  return DOMAIN_TO_UNIVERSITY[domain] || null;
}

