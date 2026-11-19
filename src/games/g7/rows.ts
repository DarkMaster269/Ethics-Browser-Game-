export interface VoterRecord {
  id: string;
  name: string;
  age: number;
  relation: string;
  address: string;
  ward: string;
  anomalyFlag?: string;
  correctAction: 'keep' | 'purge' | 'verify';
  explanation: string;
  isRealCitizen: boolean; // True if purging this would wrongly disenfranchise a legitimate voter!
}

export const voterRows: VoterRecord[] = [
  {
    id: "NGP-882194",
    name: "Mohan Lal Rathore",
    age: 74,
    relation: "Son of Late D. Rathore",
    address: "Room 14, Bapu Nagar Chawl, Ward 4",
    ward: "Ward 4 (Railway Colony)",
    anomalyFlag: "MUNICIPAL DEATH REGISTRY MATCH: Certificate #D-2025-991 dated 11 months ago.",
    correctAction: "purge",
    explanation: "PURGE: Official municipal death registry confirms voter passed away last year. Keeping on roll allows proxy ghost voting.",
    isRealCitizen: false
  },
  {
    id: "NGP-310482",
    name: "Sunita Devi",
    age: 42,
    relation: "Wife of Rajendra Prasad",
    address: "H.No 12/B, Old Cloth Market, Ward 9",
    ward: "Ward 9 (Bazaar Area)",
    anomalyFlag: "Minor spelling variation in father's name on electoral photo identity card.",
    correctAction: "keep",
    explanation: "KEEP: Minor clerical spelling typos are common. Denying voting rights over minor spelling discrepancies is wrongful voter suppression.",
    isRealCitizen: true
  },
  {
    id: "NGP-990145",
    name: "Ajay Devgan (Alias)",
    age: 33,
    relation: "Self",
    address: "Transformer Substation Shed 4, Ward 12",
    ward: "Ward 12 (Industrial Zone)",
    anomalyFlag: "164 voters registered to this single 15 sq ft electrical transformer shack.",
    correctAction: "purge",
    explanation: "PURGE: Ghost cluster! 164 voters registered to an uninhabitable electrical substation is an organized vote-padding scam.",
    isRealCitizen: false
  },
  {
    id: "NGP-449102",
    name: "Zoya Fatima",
    age: 19,
    relation: "Daughter of Tariq Mansoor",
    address: "Plot 88, Noor Basti, Ward 3",
    ward: "Ward 3 (River Bank)",
    anomalyFlag: "First-time young voter registered recently during college campus enrollment drive.",
    correctAction: "keep",
    explanation: "KEEP: Valid first-time voter with verified educational enrollment documentation.",
    isRealCitizen: true
  },
  {
    id: "NGP-772910",
    name: "Kailash Chand Verma",
    age: 51,
    relation: "Son of R. Verma",
    address: "Flat 402, Golden Heights, Ward 7",
    ward: "Ward 7 (Civil Lines)",
    anomalyFlag: "Identical photograph and biometric hash found registered in neighboring Ward 2 under name 'K. C. Verma'.",
    correctAction: "purge",
    explanation: "PURGE (Duplicate): Cross-ward duplicate registration with identical biometric identity. Voter must vote only in one domicile.",
    isRealCitizen: false
  },
  {
    id: "NGP-118492",
    name: "Basanti Bai",
    age: 82,
    relation: "Wife of Late Shambu",
    address: "Informal Settlement near Ring Road, Ward 15",
    ward: "Ward 15 (Slum Cluster)",
    anomalyFlag: "No electricity bill available; relies on local ration card and anganwadi verification.",
    correctAction: "keep",
    explanation: "KEEP: Homeless or informal settlement residents who lack utility bills are legally entitled to vote via ration cards and anganwadi rolls.",
    isRealCitizen: true
  },
  {
    id: "NGP-661039",
    name: "Vikram Malhotra",
    age: 38,
    relation: "Son of Ashok Malhotra",
    address: "House 55, Defense Colony, Ward 1",
    ward: "Ward 1 (Cantonment)",
    anomalyFlag: "Neighbor reported voter relocated to London 4 years ago, but family claims temporary stay.",
    correctAction: "verify",
    explanation: "FIELD VERIFY: Inconclusive residence status. Booth Level Officer must conduct in-person inquiry before disenfranchising citizen.",
    isRealCitizen: true
  },
  {
    id: "NGP-554109",
    name: "Pooja Kumari",
    age: 27,
    relation: "Wife of Amit Sen",
    address: "Quarter 18, Textile Mills Colony, Ward 8",
    ward: "Ward 8 (Mill Gate)",
    anomalyFlag: "Recent surname change after marriage; previous voter card active in her parental town.",
    correctAction: "verify",
    explanation: "FIELD VERIFY: Standard post-marriage relocation. Requires Form 8 transfer verification to avoid duplicate entry without stripping her vote.",
    isRealCitizen: true
  },
  {
    id: "NGP-902381",
    name: "Suresh Babu",
    age: 121,
    relation: "Son of Not Recorded",
    address: "Vacant Municipal Waste Dump, Ward 6",
    ward: "Ward 6 (South Ward)",
    anomalyFlag: "Reported age 121 years. Address is an empty municipal dump. No life certificate exists.",
    correctAction: "purge",
    explanation: "PURGE: Centenarian ghost voter anomaly registered at a municipal dumping ground with no verified proof of life.",
    isRealCitizen: false
  },
  {
    id: "NGP-738201",
    name: "Gopal Krishna Murthy",
    age: 63,
    relation: "Son of S. Murthy",
    address: "Lane 3, Teachers Colony, Ward 5",
    ward: "Ward 5 (University Ward)",
    anomalyFlag: "Retired high school teacher; verified long-term resident.",
    correctAction: "keep",
    explanation: "KEEP: Verified legitimate citizen and community elder with flawless civic records.",
    isRealCitizen: true
  },
  {
    id: "NGP-482019",
    name: "Amitabh Bannerjee",
    age: 49,
    relation: "Son of P. Bannerjee",
    address: "Shop No. 7 (Hardware Store), Ward 11",
    ward: "Ward 11 (Commercial Hub)",
    anomalyFlag: "32 adults registered as residential residents in a 100 sq ft plumbing warehouse.",
    correctAction: "purge",
    explanation: "PURGE: Commercial property falsely registered as residential mass dwelling for phantom voters.",
    isRealCitizen: false
  },
  {
    id: "NGP-621903",
    name: "Lakshmi Narayanan",
    age: 34,
    relation: "Son of Narayanan K.",
    address: "House 204, Model Town, Ward 10",
    ward: "Ward 10 (Model Town)",
    anomalyFlag: "Electoral register lists address as 'Model Twon' due to data entry clerk typing error.",
    correctAction: "keep",
    explanation: "KEEP: Pure typographic error by election commission data entry staff. Citizen is genuine resident.",
    isRealCitizen: true
  },
  {
    id: "NGP-339104",
    name: "Parveen Bano",
    age: 29,
    relation: "Wife of Aslam Khan",
    address: "Gali No 4, Weaver's Colony, Ward 13",
    ward: "Ward 13 (Old Nagarpur)",
    anomalyFlag: "Challenged by rival party agent claiming she moved away; local shopkeeper says she lives there.",
    correctAction: "verify",
    explanation: "FIELD VERIFY: Partisan objections by party agents require unbiased field verification to prevent malicious suppression of minority voters.",
    isRealCitizen: true
  },
  {
    id: "NGP-884912",
    name: "Dharmendra Singh",
    age: 58,
    relation: "Son of H. Singh",
    address: "Plot 10, Green Meadows, Ward 2",
    ward: "Ward 2 (Suburbs)",
    anomalyFlag: "Voter card photo is a stock photo of an American actor downloaded from internet.",
    correctAction: "purge",
    explanation: "PURGE: Fictitious voter profile created with stock celebrity photograph.",
    isRealCitizen: false
  },
  {
    id: "NGP-192847",
    name: "Manjula Patel",
    age: 52,
    relation: "Wife of K. Patel",
    address: "Building B, Shanti Niketan, Ward 7",
    ward: "Ward 7 (Civil Lines)",
    anomalyFlag: "House door was locked during initial daytime verification visit on a weekday.",
    correctAction: "verify",
    explanation: "FIELD VERIFY: Working citizens often have locked doors during office hours. Immediate purge is illegal; second weekend visit required.",
    isRealCitizen: true
  },
  {
    id: "NGP-573829",
    name: "Ram Charan",
    age: 46,
    relation: "Son of B. Charan",
    address: "Municipal Public Toilet Block #3, Ward 14",
    ward: "Ward 14 (Central Bus Stand)",
    anomalyFlag: "Registered address is a municipal pay-and-use public toilet.",
    correctAction: "purge",
    explanation: "PURGE: Fabricated address at a public facility used to inflate the electoral roll.",
    isRealCitizen: false
  },
  {
    id: "NGP-609182",
    name: "Anand Swaminathan",
    age: 31,
    relation: "Son of R. Swaminathan",
    address: "Flat 12, Cauvery Apartments, Ward 5",
    ward: "Ward 5 (University Ward)",
    anomalyFlag: "Resident for 8 years, pays municipal water tax, valid passport attached.",
    correctAction: "keep",
    explanation: "KEEP: High-integrity verified resident with complete municipal documentation.",
    isRealCitizen: true
  },
  {
    id: "NGP-749102",
    name: "Geeta Sen",
    age: 67,
    relation: "Wife of Late B. Sen",
    address: "House 91, Ward 12",
    ward: "Ward 12 (Industrial Zone)",
    anomalyFlag: "Hospital death notification reported identical name and age 3 weeks ago.",
    correctAction: "verify",
    explanation: "FIELD VERIFY: Because name is common, cross-check hospital record with household before final deletion to avoid accidental disenfranchisement.",
    isRealCitizen: true
  }
];
