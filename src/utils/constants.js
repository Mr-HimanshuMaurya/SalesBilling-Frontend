export const SERVICES = [
  { value: "Printer", label: "Printer" },
];

export const DEFAULT_SPECS = {
  Printer: ["Quantity", "Type", "Part"],
};

export const GST_TYPES = [
  { value: "IGST", label: "IGST 18%" },
  { value: "CGST_SGST", label: "SGST 9% + CGST 9%" },
  { value: "NO_GST", label: "No GST" },
];

export const GST_RATE = 18;
export const CGST_RATE = 9;
export const SGST_RATE = 9;

export const ROLE_LABELS = {
  superadmin: "Super Admin",
  sales: "Sales",
  accountant: "Accountant",
  server_admin: "Server Admin",
};

export const ROLE_COLORS = {
  superadmin: "bg-purple-100 text-purple-700",
  sales: "bg-blue-100 text-blue-700",
  accountant: "bg-green-100 text-green-700",
  server_admin: "bg-indigo-100 text-indigo-700",
};

export const STATUS_COLORS = {
  inactive: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  suspended: "bg-orange-100 text-orange-700",
  draft: "bg-gray-200 text-gray-700",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  correction: "bg-orange-100 text-orange-700",
  orange: "bg-orange-100 text-orange-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

export const STATUS_LABELS = {
  draft: "Proforma Invoice",
  pending_approval: "Pending Approval",
  approved: "Approved",
  correction: "Correction",
};

export const companyInfo = {
  companyName: "ASHATHA ENTERPRISES",
  addressLine1: "B-5 Jyoti building,66 behind icici bank",
  addressLine2: "Nehru place delhi",
  cityPincode: "Delhi-110019",
  // gstin: "07AALCP3083C1ZH",
  stateName: "Delhi",
  stateCode: "07",
  // cin: "U74999DL2020PTC367460",
  email: "shakshisingh1501990@gmail.com",
  // website: "www.cloudedata.com",
  bankAccountHolder: "Ashatha ENTERPRISES",
  bankName: "Axis Bank",
  bankAccountNumber: "923010044616794",
  bankBranch: "Boisar (Boisor)",
  bankIFSC: "UTIB0001291",
  jurisdiction: "DELHI",
  declarationTerms: [
    "Support Other Than Printer Services will not be Provided.",
    "For Software related query, Kindly Contact to the respected Software Company only.",
  ],
  governmentLaw:
    "This Agreement shall be governed by the laws of India, and any disputes shall fall under the exclusive jurisdiction of the courts at New Delhi.",
  jurisdiction: "DELHI",
};
