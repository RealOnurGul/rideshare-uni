// Allowed university email domains for signup
// Email must end with one of these domains (case-insensitive)
export const ALLOWED_DOMAINS = [
  "mail.utoronto.ca",
  "student.ubc.ca",
  "mcgill.ca",
  "mcmaster.ca",
  "ualberta.ca",
  "umontreal.ca",
  "uwaterloo.ca",
  "uwo.ca",
  "queensu.ca",
  "ucalgary.ca",
  "sfu.ca",
  "my.yorku.ca",
  "uottawa.ca",
  "dal.ca",
  "ulaval.ca",
  "uvic.ca",
  "usask.ca",
  "mail.concordia.ca",
  "uoguelph.ca",
  "carleton.ca",
  "umanitoba.ca",
  "mun.ca",
  "torontomu.ca",
  "uqam.ca",
  "unb.ca",
  "usherbrooke.ca",
  "wlu.ca",
  "brocku.ca",
  "uregina.ca",
  "uwindsor.ca",
  "uqtr.ca",
  "trentu.ca",
  "lakeheadu.ca",
  "uqac.ca",
  "mta.ca",
  "smu.ca",
  "acadiau.ca",
  "upei.ca",
  "umoncton.ca",
  "uleth.ca",
  "tru.ca",
  "royalroads.ca",
  "capilanou.ca",
  "kpu.ca",
  "viu.ca",
  "mtroyal.ca",
  "macewan.ca",
  "laurentian.ca",
  "nipissingu.ca",
  "ubishops.ca",
  "brandonu.ca",
  "algomau.ca",
  "unbc.ca",
  "ecuad.ca",
  "ocadu.ca",
  "ufv.ca",
  "twu.ca",
  "stfx.ca",
  "msvu.ca",
  "ukings.ca",
  "usainteanne.ca",
  "uqo.ca",
  "uqar.ca",
  "uqat.ca",
  "cmu.ca",
  "crandallu.ca",
  "stu.ca",
  "redeemer.ca",
  "ustpaul.ca",
];

// Map domains to university names
export const DOMAIN_TO_UNIVERSITY: Record<string, string> = {
  "mail.utoronto.ca": "University of Toronto",
  "student.ubc.ca": "University of British Columbia",
  "mcgill.ca": "McGill University",
  "mcmaster.ca": "McMaster University",
  "ualberta.ca": "University of Alberta",
  "umontreal.ca": "Université de Montréal",
  "uwaterloo.ca": "University of Waterloo",
  "uwo.ca": "Western University",
  "queensu.ca": "Queen's University",
  "ucalgary.ca": "University of Calgary",
  "sfu.ca": "Simon Fraser University",
  "my.yorku.ca": "York University",
  "uottawa.ca": "University of Ottawa",
  "dal.ca": "Dalhousie University",
  "ulaval.ca": "Université Laval",
  "uvic.ca": "University of Victoria",
  "usask.ca": "University of Saskatchewan",
  "mail.concordia.ca": "Concordia University",
  "uoguelph.ca": "University of Guelph",
  "carleton.ca": "Carleton University",
  "umanitoba.ca": "University of Manitoba",
  "mun.ca": "Memorial University of Newfoundland",
  "torontomu.ca": "Toronto Metropolitan University",
  "uqam.ca": "Université du Québec à Montréal",
  "unb.ca": "University of New Brunswick",
  "usherbrooke.ca": "Université de Sherbrooke",
  "wlu.ca": "Wilfrid Laurier University",
  "brocku.ca": "Brock University",
  "uregina.ca": "University of Regina",
  "uwindsor.ca": "University of Windsor",
  "uqtr.ca": "Université du Québec à Trois-Rivières",
  "trentu.ca": "Trent University",
  "lakeheadu.ca": "Lakehead University",
  "uqac.ca": "Université du Québec à Chicoutimi",
  "mta.ca": "Mount Allison University",
  "smu.ca": "Saint Mary's University",
  "acadiau.ca": "Acadia University",
  "upei.ca": "University of Prince Edward Island",
  "umoncton.ca": "Université de Moncton",
  "uleth.ca": "University of Lethbridge",
  "tru.ca": "Thompson Rivers University",
  "royalroads.ca": "Royal Roads University",
  "capilanou.ca": "Capilano University",
  "kpu.ca": "Kwantlen Polytechnic University",
  "viu.ca": "Vancouver Island University",
  "mtroyal.ca": "Mount Royal University",
  "macewan.ca": "MacEwan University",
  "laurentian.ca": "Laurentian University",
  "nipissingu.ca": "Nipissing University",
  "ubishops.ca": "Bishop's University",
  "brandonu.ca": "Brandon University",
  "algomau.ca": "Algoma University",
  "unbc.ca": "University of Northern British Columbia",
  "ecuad.ca": "Emily Carr University of Art and Design",
  "ocadu.ca": "OCAD University",
  "ufv.ca": "University of the Fraser Valley",
  "twu.ca": "Trinity Western University",
  "stfx.ca": "St. Francis Xavier University",
  "msvu.ca": "Mount Saint Vincent University",
  "ukings.ca": "University of King's College",
  "usainteanne.ca": "Université Sainte-Anne",
  "uqo.ca": "Université du Québec en Outaouais",
  "uqar.ca": "Université du Québec à Rimouski",
  "uqat.ca": "Université du Québec en Abitibi-Témiscamingue",
  "cmu.ca": "Canadian Mennonite University",
  "crandallu.ca": "Crandall University",
  "stu.ca": "St. Thomas University (NB)",
  "redeemer.ca": "Redeemer University",
  "ustpaul.ca": "Saint Paul University",
};

export function isAllowedDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  // Check if email ends with any allowed domain
  return ALLOWED_DOMAINS.some(allowedDomain => 
    domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
  );
}

export function getUniversityFromEmail(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  
  // Try exact match first
  if (DOMAIN_TO_UNIVERSITY[domain]) {
    return DOMAIN_TO_UNIVERSITY[domain];
  }
  
  // Try to find matching domain (handles subdomains)
  for (const [allowedDomain, university] of Object.entries(DOMAIN_TO_UNIVERSITY)) {
    if (domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)) {
      return university;
    }
  }
  
  return null;
}

export function getUniversityName(domain: string): string | null {
  const lowerDomain = domain.toLowerCase();
  
  // Try exact match first
  if (DOMAIN_TO_UNIVERSITY[lowerDomain]) {
    return DOMAIN_TO_UNIVERSITY[lowerDomain];
  }
  
  // Try to find matching domain (handles subdomains)
  for (const [allowedDomain, university] of Object.entries(DOMAIN_TO_UNIVERSITY)) {
    if (lowerDomain === allowedDomain || lowerDomain.endsWith(`.${allowedDomain}`)) {
      return university;
    }
  }
  
  return null;
}
