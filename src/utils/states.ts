export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
  PR: "Puerto Rico",
  VI: "Virgin Islands",
  GU: "Guam",
  AS: "American Samoa",
  MP: "Northern Mariana Islands",
};

export function getFullStateName(code: string): string {
  return STATE_NAMES[code] || `State of ${code}`;
}

export function getPartyLabel(party: string): string {
  if (party === "D") return "Democrat";
  if (party === "R") return "Republican";
  if (party === "I") return "Independent";
  return party;
}

export function getPartyColors(party: string): { bg: string; text: string; border: string } {
  if (party === "D") return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" };
  if (party === "R") return { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" };
  return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" };
}
