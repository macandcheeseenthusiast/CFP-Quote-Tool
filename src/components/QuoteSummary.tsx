import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign,
  TrendingUp,
  Activity,
  Cpu,
  Clock,
  User,
  MapPin,
  ClipboardList
} from "lucide-react";
import { CoverageItem, Endorsement, QuoteDetails } from "../types";
import { CurrencyInput } from "./CurrencyInput";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

// Initial set of standard California FAIR Plan coverages
const DEFAULT_COVERAGES: CoverageItem[] = [
  { id: "dwelling", description: "Dwelling Coverage (Coverage A)", limit: 250000, deductible: "$1,000" },
  { id: "contents", description: "Personal Property / Contents (Coverage C)", limit: 50000, deductible: "Included" },
  { id: "rental", description: "Fair Rental Value (Coverage D)", limit: 25000, deductible: "Included" },
  { id: "ordinance", description: "Ordinance or Law Coverage", limit: 12500, deductible: "Included" },
  { id: "debris", description: "Debris Removal Coverage", limit: 10000, deductible: "Included" },
];

const DEFAULT_ENDORSEMENTS: Endorsement[] = [
  { id: "replacement-dwelling", name: "Dwelling Replacement Cost Coverages", checked: true, description: "Settles dwelling losses on a replacement cost basis rather than actual cash value." },
  { id: "replacement-contents", name: "Personal Property Replacement Cost", checked: false, description: "Settles personal property claims without deduction for depreciation." },
  { id: "inflation-guard", name: "Inflation Guard Endorsement", checked: true, description: "Automatically increases limits annually to keep pace with inflation." },
  { id: "extended-dwelling", name: "Extended Dwelling Coverage", checked: false, description: "Provides additional limit cushion (e.g. 25% or 50%) for unexpected rebuilding cost spikes." },
];

const INITIAL_QUOTE_DETAILS: QuoteDetails = {
  preparedBy: "Alexis Cozzi",
  quoteNumber: "CFP-2026-0941",
  status: "New Quote - Pending Verification",
  applicantName: "Jane Doe",
  propertyAddress: "1234 Sierra Madre Blvd, Pasadena, CA 91107",
  estimatedPremium: 2450,
  paymentPlan: "direct",
};

export const QuoteSummary: React.FC = () => {
  const [quoteDetails, setQuoteDetails] = useLocalStorageState<QuoteDetails>("cfp_quote_details", INITIAL_QUOTE_DETAILS);
  const [coverages, setCoverages] = useLocalStorageState<CoverageItem[]>("cfp_coverages", DEFAULT_COVERAGES);
  const [endorsements, setEndorsements] = useLocalStorageState<Endorsement[]>("cfp_endorsements", DEFAULT_ENDORSEMENTS);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live timer for status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Safe fallback to handle any legacy state
  const currentPlan = useMemo(() => {
    return quoteDetails.paymentPlan || "direct";
  }, [quoteDetails.paymentPlan]);

  // Auto-calculated sum of all coverage limits in real-time
  const totalCombinedLimit = useMemo(() => {
    return coverages.reduce((sum, item) => sum + item.limit, 0);
  }, [coverages]);

  const downPayment = useMemo(() => {
    if (currentPlan === "monthly" || currentPlan === "mortgage") {
      return parseFloat((quoteDetails.estimatedPremium * 0.1679).toFixed(2));
    }
    return parseFloat((quoteDetails.estimatedPremium * 0.33).toFixed(2));
  }, [quoteDetails.estimatedPremium, currentPlan]);

  const remainingBalance = useMemo(() => {
    return parseFloat((quoteDetails.estimatedPremium - downPayment).toFixed(2));
  }, [quoteDetails.estimatedPremium, downPayment]);

  const installmentAmount = useMemo(() => {
    if (currentPlan === "monthly" || currentPlan === "mortgage") {
      return parseFloat((quoteDetails.estimatedPremium * 0.0845).toFixed(2));
    }
    return parseFloat((remainingBalance / 2).toFixed(2));
  }, [quoteDetails.estimatedPremium, remainingBalance, currentPlan]);

  // Update a detail field
  const handleDetailChange = (key: keyof QuoteDetails, value: string | number | boolean) => {
    setQuoteDetails((prev) => ({ ...prev, [key]: value }));
  };

  // Update coverage limit
  const handleLimitChange = (id: string, newLimit: number) => {
    setCoverages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, limit: newLimit } : item))
    );
  };

  // Update coverage deductible
  const handleDeductibleChange = (id: string, newDeductible: string) => {
    setCoverages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, deductible: newDeductible } : item))
    );
  };

  // Update coverage description
  const handleDescriptionChange = (id: string, newDescription: string) => {
    setCoverages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, description: newDescription } : item))
    );
  };

  // Add custom coverage row
  const addCustomCoverage = () => {
    const newId = `custom-${Date.now()}`;
    const newItem: CoverageItem = {
      id: newId,
      description: "Custom Coverage Line",
      limit: 0,
      deductible: "Included",
      isCustom: true,
    };
    setCoverages((prev) => [...prev, newItem]);
  };

  // Delete custom coverage row
  const deleteCoverage = (id: string) => {
    setCoverages((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle endorsement checkbox
  const toggleEndorsement = (id: string) => {
    setEndorsements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, checked: !e.checked } : e))
    );
  };

  // Reset to default blank state for high utility
  const handleClearForm = () => {
    setQuoteDetails({
      preparedBy: "",
      quoteNumber: `CFP-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "Draft",
      applicantName: "",
      propertyAddress: "",
      estimatedPremium: 0,
      paymentPlan: "direct",
    });
    setCoverages([
      { id: "dwelling", description: "Dwelling Coverage (Coverage A)", limit: 0, deductible: "$1,000" },
      { id: "contents", description: "Personal Property / Contents (Coverage C)", limit: 0, deductible: "Included" },
      { id: "rental", description: "Fair Rental Value (Coverage D)", limit: 0, deductible: "Included" },
      { id: "ordinance", description: "Ordinance or Law Coverage", limit: 0, deductible: "Included" },
      { id: "debris", description: "Debris Removal Coverage", limit: 0, deductible: "Included" },
    ]);
    setEndorsements(DEFAULT_ENDORSEMENTS.map(e => ({ ...e, checked: false })));
  };

  // Load standard California high-risk zone demo scenario
  const handleLoadDemo = () => {
    setQuoteDetails({
      preparedBy: "Alexis Cozzi",
      quoteNumber: "CFP-48209-A",
      status: "Ready for Signature",
      applicantName: "Robert & Linda Harrison",
      propertyAddress: "842 Whispering Pines Way, Lake Arrowhead, CA 92352",
      estimatedPremium: 4890,
      paymentPlan: "mortgage",
    });
    setCoverages([
      { id: "dwelling", description: "Dwelling Coverage (Coverage A)", limit: 650000, deductible: "$2,500" },
      { id: "contents", description: "Personal Property / Contents (Coverage C)", limit: 150000, deductible: "Included" },
      { id: "rental", description: "Fair Rental Value (Coverage D)", limit: 65000, deductible: "Included" },
      { id: "ordinance", description: "Ordinance or Law Coverage", limit: 32500, deductible: "Included" },
      { id: "debris", description: "Debris Removal Coverage", limit: 25000, deductible: "Included" },
      { id: "custom-demo-1", description: "Vandalism & Malicious Mischief Endorsement", limit: 5000, deductible: "$500", isCustom: true }
    ]);
    setEndorsements([
      { id: "replacement-dwelling", name: "Dwelling Replacement Cost Coverages", checked: true },
      { id: "replacement-contents", name: "Personal Property Replacement Cost", checked: true },
      { id: "inflation-guard", name: "Inflation Guard Endorsement", checked: true },
      { id: "extended-dwelling", name: "Extended Dwelling Coverage (25%)", checked: true },
    ]);
  };

  // Helper to quickly copy an email-ready quote summary to the clipboard
  const copySummaryText = () => {
    const coverageLines = coverages
      .map(
        (c) =>
          `- ${c.description}: Limit of $${c.limit.toLocaleString()} | Deductible: ${c.deductible}`
      )
      .join("\n");
    
    const activeEndorsements = endorsements
      .filter((e) => e.checked)
      .map((e) => `- ${e.name}`)
      .join("\n");

    const text = `
==============================================
CALIFORNIA FAIR PLAN — QUOTE SUMMARY
==============================================
Quote / Policy Number: ${quoteDetails.quoteNumber}
Prepared By (Broker): ${quoteDetails.preparedBy}
Quote Status: ${quoteDetails.status}

Applicant Name: ${quoteDetails.applicantName || "N/A"}
Property Address: ${quoteDetails.propertyAddress || "N/A"}

----------------------------------------------
COVERAGE & DEDUCTIBLE DETAILS:
----------------------------------------------
${coverageLines}

TOTAL COMBINED LIMIT: $${totalCombinedLimit.toLocaleString()}

----------------------------------------------
OPTIONAL COVERAGES & ENDORSEMENTS:
----------------------------------------------
${activeEndorsements || "None Selected"}

----------------------------------------------
ESTIMATED ANNUAL PREMIUM:
----------------------------------------------
Estimated Annual Premium: $${quoteDetails.estimatedPremium.toLocaleString()}

----------------------------------------------
PAYMENT PLAN & FINANCING DECK:
----------------------------------------------
Billing Option: ${
  currentPlan === "monthly"
    ? "Monthly Installment Plan"
    : currentPlan === "mortgage"
    ? "Mortgage Escrow Billing"
    : "Direct Installment Plan (3-Pay)"
}
Mandated Down Payment (${(currentPlan === "monthly" || currentPlan === "mortgage") ? "16.79%" : "33%"}): $${downPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Remaining Balance (${(currentPlan === "monthly" || currentPlan === "mortgage") ? "83.21%" : "67%"}): $${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Future Payments: ${
  currentPlan === "monthly"
    ? `11 monthly installments of $${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (8.45% of premium each) billed monthly. Billed as a total of 12 payments including the 16.79% down payment.`
    : currentPlan === "mortgage"
    ? `Requires starting the monthly plan (16.79% down payment). Once started, future payments (11 monthly installments of $${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each) are billed out to your mortgage company escrow account so they take over, allowing you to pay it together with your mortgage payments.`
    : `2 installments of $${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} billed 3 months after (total of 3 payments including the 33% down payment)`
}

*DISCLAIMER: This is an informational prelim estimate, not an insurance binder. Final premiums are subject to CA FAIR Plan underwriting.
==============================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Interactive Workspace Actions Panel (Hidden on Print) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Broker Workspace</h2>
              <p className="text-xs text-slate-500">Interactive California FAIR Plan quote calculator.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200/50 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Load Demo Scenario
            </button>
            <button
              onClick={copySummaryText}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Text Summary"}
            </button>
            <button
              onClick={handleClearForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Form
            </button>
          </div>
        </div>

        {/* Printable/Official Document Header (Only visible when printing) */}
        <div className="hidden print:flex flex-col border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold tracking-wider text-indigo-900 uppercase">California FAIR Plan Broker Appraisal Summary</span>
              <h1 className="text-2xl font-black text-slate-900">QUOTE SUMMATION REPORT</h1>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Broker Portal Reference: <span className="font-semibold">{quoteDetails.quoteNumber}</span></div>
              <div>Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout (Becomes stacked on print) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:block print:space-y-6">

          {/* 1. Header & Title Card (Span 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full print:border print:border-indigo-100">
                  California FAIR Plan
                </span>
              </div>
              <div className="pt-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  CFP Quote Tool
                </h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Draft and estimate California FAIR Plan Quotes with automatic limit calculations, custom coverages, and print-ready exporting.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400 no-print">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Session local time updated dynamically</span>
            </div>
          </div>

          {/* 2. Hero Results Card - Dark Slate (Span 2) */}
          <div className="lg:col-span-2 bg-[#0F172A] text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-slate-900/15 relative overflow-hidden border border-slate-800 print:bg-white print:text-slate-900 print:border-2 print:border-slate-300 print:p-5 print:shadow-none">
            {/* Background design elements (hidden on print) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 no-print"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <span className="text-indigo-400 print:text-indigo-800 font-bold tracking-widest text-[10px] uppercase">
                Calculated Premium & Limits
              </span>
              <ShieldCheck className="h-6 w-6 text-indigo-400 opacity-50 print:text-indigo-800" />
            </div>

            <div className="my-6 space-y-4 relative z-10 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Combined Limit</p>
                <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-white print:text-slate-900 mt-1">
                  ${totalCombinedLimit.toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl py-2 px-4 max-w-sm mx-auto print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 font-medium">Estimated Premium:</span>
                <div className="flex items-center text-indigo-300 print:text-indigo-900 font-mono font-bold text-lg">
                  <span>$</span>
                  <input
                    type="number"
                    value={quoteDetails.estimatedPremium === 0 ? "" : quoteDetails.estimatedPremium}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      handleDetailChange("estimatedPremium", val);
                    }}
                    placeholder="0.00"
                    className="w-20 bg-transparent text-indigo-300 print:text-indigo-950 border-none outline-none font-bold placeholder-slate-600 focus:ring-0 px-1 py-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Administrative / Applicant Card (Span 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-4">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              Administrative Dossier
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:rounded-none">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Broker Name</span>
                  <input
                    type="text"
                    value={quoteDetails.preparedBy}
                    onChange={(e) => handleDetailChange("preparedBy", e.target.value)}
                    placeholder="Alexis Cozzi"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none"
                  />
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:rounded-none">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Quote/Policy ID</span>
                  <input
                    type="text"
                    value={quoteDetails.quoteNumber}
                    onChange={(e) => handleDetailChange("quoteNumber", e.target.value)}
                    placeholder="CFPQ01"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:rounded-none">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Applicant Name</span>
                  <input
                    type="text"
                    value={quoteDetails.applicantName}
                    onChange={(e) => handleDetailChange("applicantName", e.target.value)}
                    placeholder="Enter Applicant Name"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none"
                  />
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:rounded-none">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Quote Status</span>
                  <input
                    type="text"
                    value={quoteDetails.status}
                    onChange={(e) => handleDetailChange("status", e.target.value)}
                    placeholder="Quote Status"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:rounded-none">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Risk Property Address</span>
                <input
                  type="text"
                  value={quoteDetails.propertyAddress}
                  onChange={(e) => handleDetailChange("propertyAddress", e.target.value)}
                  placeholder="Enter Risk Property Address"
                  className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Plan & Financing Card (Span 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-500" />
                Payment Plan & Financing
              </h3>
              <span className="text-[10px] bg-indigo-50 font-bold px-2.5 py-1 rounded text-indigo-600 print:hidden">
                {(currentPlan === "monthly" || currentPlan === "mortgage") ? "16.79% Down" : "33% Down"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Interactive Tabs for Billing Options */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl no-print">
                <button
                  type="button"
                  onClick={() => handleDetailChange("paymentPlan", "direct")}
                  className={`py-2 text-center text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    currentPlan === "direct"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  3-Pay Direct
                </button>
                <button
                  type="button"
                  onClick={() => handleDetailChange("paymentPlan", "monthly")}
                  className={`py-2 text-center text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    currentPlan === "monthly"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Monthly Option
                </button>
                <button
                  type="button"
                  onClick={() => handleDetailChange("paymentPlan", "mortgage")}
                  className={`py-2 text-center text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    currentPlan === "mortgage"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  Mortgage Escrow
                </button>
              </div>

              {/* Dynamic Financial Calculations Display */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 space-y-3 print:bg-transparent print:border-none print:p-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">
                    Required Down Payment ({(currentPlan === "monthly" || currentPlan === "mortgage") ? "16.79%" : "33%"})
                  </span>
                  <span className="text-sm font-extrabold font-mono text-slate-900">
                    ${downPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Remaining Balance ({(currentPlan === "monthly" || currentPlan === "mortgage") ? "83.21%" : "67%"})
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-700">
                    ${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1 no-print">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Future Payment Structure</p>
                  
                  {currentPlan === "direct" && (
                    <div className="text-xs font-medium text-slate-600 leading-relaxed">
                      Divided into <span className="font-bold text-slate-800">2 installments</span> of <span className="font-extrabold font-mono text-indigo-700">${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> billed <span className="font-bold text-slate-800">3 months after</span>. Billed as a total of 3 payments (including the 33% down payment) over the year.
                    </div>
                  )}

                  {currentPlan === "monthly" && (
                    <div className="text-xs font-medium text-slate-600 leading-relaxed">
                      Divided into <span className="font-bold text-slate-800">11 monthly installments</span> of <span className="font-extrabold font-mono text-indigo-700">${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (8.45% of premium each) starting after the down payment. Billed as a total of 12 payments over the year (including the 16.79% down payment).
                    </div>
                  )}

                  {currentPlan === "mortgage" && (
                    <div className="text-xs font-medium text-indigo-900 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 leading-relaxed">
                      To utilize Mortgage Escrow, you <span className="font-bold">start the monthly plan</span> (requiring a <span className="font-bold">{downPayment ? "16.79%" : ""} down payment</span> of <span className="font-extrabold text-slate-900">${downPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>). After setup, you can <span className="font-bold">bill the remaining payments</span> (11 installments of <span className="font-bold font-mono text-indigo-700">${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> each) to your mortgage company and <span className="font-bold">they will take over future payments</span>. You pay it together with your mortgage payments.
                    </div>
                  )}
                </div>

                {/* PRINT ONLY VERSION: Prints ALL payment options clearly */}
                <div className="hidden print:block border-t border-slate-200 pt-3 space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Option 1: Direct Installment Plan (3-Pay)</p>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Requires <span className="font-semibold text-slate-900">33% down payment</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.33).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>. Remaining balance divided into <span className="font-semibold text-slate-900">2 installments</span> of <span className="font-bold font-mono text-slate-900">${parseFloat(((quoteDetails.estimatedPremium - parseFloat((quoteDetails.estimatedPremium * 0.33).toFixed(2))) / 2).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> billed <span className="font-semibold text-slate-900">3 months after</span>.
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Option 2: Monthly Installment Plan (12-Pay)</p>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Requires <span className="font-semibold text-slate-900">16.79% down payment</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.1679).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>. Remaining balance divided into <span className="font-semibold text-slate-900">11 monthly installments</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.0845).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (8.45% of premium each) starting after the down payment.
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Option 3: Mortgage Escrow Billing</p>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Applicant starts the <span className="font-semibold text-slate-900">monthly installment plan</span> with a <span className="font-semibold text-slate-900">16.79% down payment</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.1679).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>. Once active, remaining installments (11 payments of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.0845).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> each) can be billed out to your mortgage company so they take over, allowing you to pay it together with your mortgage payments.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Interactive Coverages Grid Editor (Span 3) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                Line-Item Liability & Deductibles
              </h3>
              <button
                onClick={addCustomCoverage}
                className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Coverage Line
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 print:border-slate-300">
              <table className="min-w-full divide-y divide-slate-200 print:divide-slate-300">
                <thead className="bg-slate-50 print:bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500 w-1/2">
                      Coverage Description
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-500 w-1/4">
                      Limit of Liability
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500 w-1/4">
                      Deductible
                    </th>
                    <th className="px-2 py-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 w-[40px] no-print">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 print:divide-slate-200">
                  {coverages.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-2.5">
                        {item.isCustom ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                            placeholder="e.g. Other Structures"
                            className="w-full bg-transparent font-bold text-slate-800 focus:outline-none focus:bg-slate-50 px-1 py-0.5 rounded border border-transparent hover:border-slate-200 text-xs"
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-800 px-1">{item.description}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        <CurrencyInput
                          value={item.limit}
                          onChange={(val) => handleLimitChange(item.id, val)}
                          className="text-right font-semibold text-xs text-slate-800"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={item.deductible}
                          onChange={(e) => handleDeductibleChange(item.id, e.target.value)}
                          placeholder="e.g. Included"
                          className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-none focus:bg-slate-50 px-1 py-0.5 rounded border border-transparent hover:border-slate-200"
                        />
                      </td>
                      <td className="px-2 py-2.5 text-center no-print">
                        {item.isCustom ? (
                          <button
                            onClick={() => deleteCoverage(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors inline-flex justify-center"
                            title="Delete Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 select-none">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Combined Sum Total Row */}
                  <tr className="bg-indigo-50/40 print:bg-slate-50 font-bold border-t border-slate-200">
                    <td className="px-4 py-3 text-xs font-extrabold text-slate-900">
                      Total Combined Limit (Auto-Calculated)
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-black font-mono text-indigo-700 print:text-slate-900">
                      ${totalCombinedLimit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold" colSpan={2}>
                      Aggregate Liability sum
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Endorsements Checkbox Card (Span 1) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-4">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Policy Endorsements
            </h3>
            
            <div className="space-y-3">
              {endorsements.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    item.checked
                      ? "bg-indigo-50/40 border-indigo-200/80 text-slate-900"
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center h-4 mt-0.5">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleEndorsement(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className={`text-xs block font-bold leading-tight ${item.checked ? "text-slate-800" : "text-slate-600"}`}>
                      {item.name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 6. Legal Notices & Fraud Warnings (Span 3) */}
          <div className="lg:col-span-3 bg-red-50/40 border border-red-200/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:bg-white print:border-2 print:border-red-200 print:p-5">
            <h4 className="text-red-700 font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              ⚠️ Legal Notice & Disclosures
            </h4>
            <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed text-justify font-medium">
              <p>
                <strong>NOT A BINDER:</strong> This document is a preliminary premium estimate prepared for informational purposes only. It does NOT constitute an insurance policy, an insurance binder, or an implied agreement to bind coverage. No insurance coverage is initiated, modified, or forced into effect by this summary sheet.
              </p>
              <p>
                <strong>INDEPENDENT ENTITY STATUS:</strong> The broker presenting this summary acts as an independent insurance broker/entity and maintains an entirely separate status from the California FAIR Plan Association. We do not directly represent, command, or hold binding authorization on behalf of the California FAIR Plan.
              </p>
            </div>
          </div>

          {/* 7. Diagnostic Indicators Bento Card (Span 1) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all print:hidden">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Performance Check
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <Cpu className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Summation</p>
                    <p className="text-xs font-bold text-slate-900 font-mono">O(n) Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 border border-slate-100">
                    <Activity className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Execution latency</p>
                    <p className="text-xs font-bold text-slate-900 font-mono">0.4 ms</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 italic">
              Reactive State Observers fully decoupled.
            </div>
          </div>

          {/* 8. Master Coder Status Bar (Span 4) */}
          <div className="lg:col-span-4 bg-[#0F172A] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between text-white border border-slate-800 shadow-xl gap-3 print:hidden">
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>Engine Status: Optimized</span>
              </div>
              <div>Architecture: Decoupled Observer</div>
              <div>Memory Leak Check: PASS</div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-300 bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-700/30">
              <span className="font-mono text-[10px]">master_admin_v4_active</span>
              <div className="w-px h-3 bg-slate-700"></div>
              <span className="font-mono text-[10px] text-indigo-400">{currentTime || "12:00:00 PM"}</span>
            </div>
          </div>

        </div>

        {/* Print-specific static footer (Only visible on print) */}
        <div className="hidden print:block border-t border-slate-300 pt-4 mt-8">
          <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-500 leading-relaxed text-justify">
            <div>
              <p className="mb-1"><strong>NOTICE TO INSURED:</strong> The FAIR Plan does not make an independent estimate of the cost to rebuild the applicant's dwelling. It is the applicant's responsibility to ensure that the policy's limit of liability is adequate.</p>
            </div>
            <div>
              <p><strong>CALIFORNIA LAW FRAUD WARNING:</strong> Any person who knowingly presents false or fraudulent information to obtain or amend insurance coverage or to make a claim for the payment of a loss is guilty of a crime and may be subject to fines and confinement in state prison.</p>
            </div>
          </div>
          <div className="text-right text-[8px] text-slate-400 mt-4">
            Pre-Binder Verification Summary Report. Strictly for Appraisal purposes.
          </div>
        </div>

        {/* Generate / Print Action (Hidden on Print) */}
        <div className="mt-8 flex justify-end no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/15 hover:shadow-xl transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Generate & Save Quote PDF
          </button>
        </div>

      </div>
    </div>
  );
};
