export interface CoverageItem {
  id: string;
  description: string;
  limit: number; // Numeric value to allow easy summation
  deductible: string; // Can be a currency string, "Included", or custom text
  isCustom?: boolean;
}

export interface Endorsement {
  id: string;
  name: string;
  checked: boolean;
  description?: string;
}

export interface QuoteDetails {
  preparedBy: string;
  quoteNumber: string;
  status: string;
  applicantName: string;
  propertyAddress: string;
  estimatedPremium: number;
  paymentPlan?: "direct" | "mortgage" | "monthly";
}
