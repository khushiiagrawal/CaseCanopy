export interface LegalCase {
  id: string;
  title: string;
  summary: string;
  jurisdiction: string;
  year: string;
  outcome: "favorable" | "unfavorable" | "mixed";
  predictionScore: number;
  similarCases: number;
  legalArguments: string[];
  tags: string[];
}

export const mockCases: LegalCase[] = [
  {
    id: "1",
    title: "Environmental Protection Agency v. Local Community",
    summary: "A landmark case establishing the right of local communities to challenge environmental permits based on cumulative impact analysis.",
    jurisdiction: "Federal Court",
    year: "2022",
    outcome: "favorable",
    predictionScore: 85,
    similarCases: 12,
    legalArguments: [
      "Community standing in environmental cases",
      "Cumulative impact analysis requirements",
      "Environmental justice considerations",
      "Public participation rights",
    ],
    tags: ["Environmental Justice", "Community Rights", "Permits", "Cumulative Impact"],
  },
  {
    id: "2",
    title: "State v. Industrial Corporation",
    summary: "Case addressing corporate liability for environmental damage and community health impacts.",
    jurisdiction: "State Court",
    year: "2021",
    outcome: "mixed",
    predictionScore: 65,
    similarCases: 8,
    legalArguments: [
      "Corporate environmental liability",
      "Community health impact assessment",
      "Remediation requirements",
      "Financial penalties",
    ],
    tags: ["Corporate Liability", "Health Impact", "Remediation", "Environmental Damage"],
  },
  {
    id: "3",
    title: "Community Coalition v. City Planning Department",
    summary: "Case challenging urban development plans based on environmental justice grounds.",
    jurisdiction: "Municipal Court",
    year: "2023",
    outcome: "favorable",
    predictionScore: 90,
    similarCases: 15,
    legalArguments: [
      "Environmental justice in urban planning",
      "Community consultation requirements",
      "Impact assessment standards",
      "Development permit conditions",
    ],
    tags: ["Urban Planning", "Environmental Justice", "Community Consultation", "Development"],
  },
];

export const jurisdictions = [
  'Federal Court',
  'State Court',
  'Supreme Court',
  'Appellate Court'
];

export const caseTypes = [
  'Environmental',
  'Civil Rights',
  'Public Health',
  'Land Use',
  'Water Rights'
];

export const tags = [
  'Pollution',
  'Indigenous Rights',
  'Air Quality',
  'Water Rights',
  'Public Health',
  'Sacred Lands',
  'Renewable Energy',
  'Cultural Rights'
]; 