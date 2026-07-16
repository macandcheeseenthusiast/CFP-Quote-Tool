import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { CoverageItem, Endorsement, QuoteDetails, Quote } from "../types";
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

const getInitialQuotes = (): Quote[] => {
  try {
    const v2 = window.localStorage.getItem("cfp_quotes_v3");
    if (v2) return JSON.parse(v2);

    const legacyDetailsStr = window.localStorage.getItem("cfp_quote_details");
    const legacyCoveragesStr = window.localStorage.getItem("cfp_coverages");
    const legacyEndorsementsStr = window.localStorage.getItem("cfp_endorsements");

    if (legacyDetailsStr || legacyCoveragesStr || legacyEndorsementsStr) {
      const details = legacyDetailsStr ? JSON.parse(legacyDetailsStr) : INITIAL_QUOTE_DETAILS;
      const coverages = legacyCoveragesStr ? JSON.parse(legacyCoveragesStr) : DEFAULT_COVERAGES;
      const endorsements = legacyEndorsementsStr ? JSON.parse(legacyEndorsementsStr) : DEFAULT_ENDORSEMENTS;

      return [
        {
          id: "quote-1",
          tabName: details.applicantName ? `Quote - ${details.applicantName}` : "Quote 1",
          details,
          coverages,
          endorsements,
        }
      ];
    }
  } catch (e) {
    console.error("Migration error", e);
  }
  return [
    {
      id: "quote-1",
      tabName: "Quote 1",
      details: INITIAL_QUOTE_DETAILS,
      coverages: DEFAULT_COVERAGES,
      endorsements: DEFAULT_ENDORSEMENTS,
    }
  ];
};

export const QuoteSummary: React.FC = () => {
  const [quotes, setQuotes] = useLocalStorageState<Quote[]>("cfp_quotes_v3", getInitialQuotes());
  const [activeQuoteId, setActiveQuoteId] = useLocalStorageState<string>("cfp_active_quote_id", "quote-1");
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const activeQuote = useMemo(() => {
    return quotes.find((q) => q.id === activeQuoteId) || quotes[0] || {
      id: "quote-1",
      tabName: "Quote 1",
      details: INITIAL_QUOTE_DETAILS,
      coverages: DEFAULT_COVERAGES,
      endorsements: DEFAULT_ENDORSEMENTS,
    };
  }, [quotes, activeQuoteId]);

  const quoteDetails = activeQuote.details;
  const coverages = activeQuote.coverages;
  const endorsements = activeQuote.endorsements;

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
    return parseFloat((quoteDetails.estimatedPremium * 0.4012).toFixed(2));
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

  const updateActiveQuote = (updater: (quote: Quote) => Quote) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === activeQuote.id ? updater(q) : q))
    );
  };

  // Update a detail field
  const handleDetailChange = (key: keyof QuoteDetails, value: string | number | boolean) => {
    updateActiveQuote((q) => {
      let updatedTabName = q.tabName;
      if (key === "applicantName" && typeof value === "string") {
        if (value.trim()) {
          updatedTabName = `Quote - ${value.trim()}`;
        } else {
          updatedTabName = "Quote 1";
        }
      }
      return {
        ...q,
        details: { ...q.details, [key]: value },
        tabName: updatedTabName
      };
    });
  };

  // Update coverage limit
  const handleLimitChange = (id: string, newLimit: number) => {
    updateActiveQuote((q) => ({
      ...q,
      coverages: q.coverages.map((item) => (item.id === id ? { ...item, limit: newLimit } : item)),
    }));
  };

  // Update coverage deductible
  const handleDeductibleChange = (id: string, newDeductible: string) => {
    updateActiveQuote((q) => ({
      ...q,
      coverages: q.coverages.map((item) => (item.id === id ? { ...item, deductible: newDeductible } : item)),
    }));
  };

  // Update coverage description
  const handleDescriptionChange = (id: string, newDescription: string) => {
    updateActiveQuote((q) => ({
      ...q,
      coverages: q.coverages.map((item) => (item.id === id ? { ...item, description: newDescription } : item)),
    }));
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
    updateActiveQuote((q) => ({
      ...q,
      coverages: [...q.coverages, newItem],
    }));
  };

  // Delete custom coverage row
  const deleteCoverage = (id: string) => {
    updateActiveQuote((q) => ({
      ...q,
      coverages: q.coverages.filter((item) => item.id !== id),
    }));
  };

  // Toggle endorsement checkbox
  const toggleEndorsement = (id: string) => {
    updateActiveQuote((q) => ({
      ...q,
      endorsements: q.endorsements.map((e) => (e.id === id ? { ...e, checked: !e.checked } : e)),
    }));
  };

  // Reset to default blank state for high utility
  const handleClearForm = () => {
    updateActiveQuote((q) => ({
      ...q,
      details: {
        preparedBy: "",
        quoteNumber: `CFP-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "Draft",
        applicantName: "",
        propertyAddress: "",
        estimatedPremium: 0,
        paymentPlan: "direct",
      },
      coverages: [
        { id: "dwelling", description: "Dwelling Coverage (Coverage A)", limit: 0, deductible: "$1,000" },
        { id: "contents", description: "Personal Property / Contents (Coverage C)", limit: 0, deductible: "Included" },
        { id: "rental", description: "Fair Rental Value (Coverage D)", limit: 0, deductible: "Included" },
        { id: "ordinance", description: "Ordinance or Law Coverage", limit: 0, deductible: "Included" },
        { id: "debris", description: "Debris Removal Coverage", limit: 0, deductible: "Included" },
      ],
      endorsements: DEFAULT_ENDORSEMENTS.map((e) => ({ ...e, checked: false })),
    }));
  };

  // Load standard California high-risk zone demo scenario
  const handleLoadDemo = () => {
    updateActiveQuote((q) => ({
      ...q,
      tabName: "Demo - Harrison",
      details: {
        preparedBy: "Alexis Cozzi",
        quoteNumber: "CFP-48209-A",
        status: "Ready for Signature",
        applicantName: "Robert & Linda Harrison",
        propertyAddress: "842 Whispering Pines Way, Lake Arrowhead, CA 92352",
        estimatedPremium: 4890,
        paymentPlan: "mortgage",
      },
      coverages: [
        { id: "dwelling", description: "Dwelling Coverage (Coverage A)", limit: 650000, deductible: "$2,500" },
        { id: "contents", description: "Personal Property / Contents (Coverage C)", limit: 150000, deductible: "Included" },
        { id: "rental", description: "Fair Rental Value (Coverage D)", limit: 65000, deductible: "Included" },
        { id: "ordinance", description: "Ordinance or Law Coverage", limit: 32500, deductible: "Included" },
        { id: "debris", description: "Debris Removal Coverage", limit: 25000, deductible: "Included" },
        { id: "custom-demo-1", description: "Vandalism & Malicious Mischief Endorsement", limit: 5000, deductible: "$500", isCustom: true }
      ],
      endorsements: [
        { id: "replacement-dwelling", name: "Dwelling Replacement Cost Coverages", checked: true },
        { id: "replacement-contents", name: "Personal Property Replacement Cost", checked: true },
        { id: "inflation-guard", name: "Inflation Guard Endorsement", checked: true },
        { id: "extended-dwelling", name: "Extended Dwelling Coverage (25%)", checked: true },
      ],
    }));
  };

  // Add a new blank quote
  const createNewQuote = () => {
    const newId = `quote-${Date.now()}`;
    const newQuote: Quote = {
      id: newId,
      tabName: `Quote ${quotes.length + 1}`,
      details: {
        preparedBy: activeQuote.details.preparedBy || "Alexis Cozzi",
        quoteNumber: `CFP-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "Draft",
        applicantName: "",
        propertyAddress: "",
        estimatedPremium: 0,
        paymentPlan: "direct",
      },
      coverages: DEFAULT_COVERAGES.map((c) => ({ ...c, limit: 0 })),
      endorsements: DEFAULT_ENDORSEMENTS.map((e) => ({ ...e, checked: false })),
    };
    setQuotes((prev) => [...prev, newQuote]);
    setActiveQuoteId(newId);
  };

  // Duplicate an existing quote
  const duplicateQuote = (quoteToCopy: Quote) => {
    const newId = `quote-${Date.now()}`;
    const newQuote: Quote = {
      id: newId,
      tabName: `${quoteToCopy.tabName} (Copy)`,
      details: {
        ...quoteToCopy.details,
        quoteNumber: `CFP-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      coverages: quoteToCopy.coverages.map((c) => ({ ...c })),
      endorsements: quoteToCopy.endorsements.map((e) => ({ ...e })),
    };
    setQuotes((prev) => [...prev, newQuote]);
    setActiveQuoteId(newId);
  };

  // Delete a quote
  const deleteQuote = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (quotes.length <= 1) {
      alert("You must keep at least one quote.");
      return;
    }
    
    if (activeQuote.id === idToDelete) {
      const remaining = quotes.filter((q) => q.id !== idToDelete);
      setActiveQuoteId(remaining[0].id);
    }
    
    setQuotes((prev) => prev.filter((q) => q.id !== idToDelete));
  };

  // Rename a quote's tab specifically
  const renameQuoteTab = (id: string, newName: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, tabName: newName } : q))
    );
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
Mandated Down Payment (${(currentPlan === "monthly" || currentPlan === "mortgage") ? "16.79%" : "40.12%"}): $${downPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Remaining Balance (${(currentPlan === "monthly" || currentPlan === "mortgage") ? "83.21%" : "59.88%"}): $${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Future Payments: ${
  currentPlan === "monthly"
    ? `11 monthly installments of $${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (8.45% of premium each) billed monthly. Billed as a total of 12 payments including the 16.79% down payment.`
    : currentPlan === "mortgage"
    ? `Requires starting the monthly plan (16.79% down payment). Once started, future payments (11 monthly installments of $${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each) are billed out to your mortgage company escrow account so they take over, allowing you to pay it together with your mortgage payments.`
    : `2 installments of $${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} billed 3 months after (total of 3 payments including the 40.12% down payment)`
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
        
        {/* Active Quotes Workspace Tabs (Hidden on Print) */}
        <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-950">
                Active Quote Worksheets
              </span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold font-mono">
                {quotes.length}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              💡 <span className="font-medium text-slate-500">Pro-tip:</span> Type in the active tab to rename it • Hover tabs to duplicate or delete
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <AnimatePresence mode="popLayout">
              {quotes.map((q) => {
                const isActive = q.id === activeQuote.id;
                return (
                  <motion.div
                    key={q.id}
                    layoutId={`tab-${q.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={() => setActiveQuoteId(q.id)}
                    className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-extrabold cursor-pointer transition-all select-none ${
                      isActive
                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md shadow-slate-900/10"
                        : "bg-slate-50/50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    
                    {isActive ? (
                      <input
                        type="text"
                        value={q.tabName}
                        onChange={(e) => renameQuoteTab(q.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent resetting active tab
                        className="bg-transparent text-white font-extrabold border-none outline-none focus:ring-0 p-0 w-28 text-xs focus:bg-slate-800/50 px-1 rounded"
                        placeholder="Untitled Quote"
                      />
                    ) : (
                      <span className="truncate max-w-[120px]">{q.tabName || "Untitled Quote"}</span>
                    )}

                    {/* Action buttons inside tab */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateQuote(q);
                        }}
                        title="Duplicate Quote Workspace"
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {quotes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuote(q.id, e);
                          }}
                          title="Delete Quote Workspace"
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createNewQuote}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 text-xs font-bold cursor-pointer transition-all"
              title="Create New Blank Quote Worksheet"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Quote Worksheet</span>
            </motion.button>
          </div>
        </div>
        
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
        <div className="hidden print:flex flex-row justify-between items-center border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-950 rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
              CFP
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-indigo-900 uppercase block">California FAIR Plan Premium Estimate</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">PROPERTY VALUATION & QUOTE ESTIMATE</h1>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500 space-y-0.5">
            <div><span className="font-semibold text-slate-700">Estimate Reference:</span> <span className="font-mono font-bold text-slate-900">{quoteDetails.quoteNumber}</span></div>
            <div><span className="font-semibold text-slate-700">Date Generated:</span> <span className="font-bold text-slate-900">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
            <div><span className="font-semibold text-slate-700">Valid Through:</span> <span className="font-bold text-slate-900">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} (30 Days)</span></div>
          </div>
        </div>

        {/* Bento Grid Layout (Becomes stacked on print) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:block print:space-y-6">

          {/* 1. Header & Title Card (Span 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all no-print">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  California FAIR Plan
                </span>
              </div>
              <div className="pt-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  CFP Quote Tool
                </h1>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Session local time updated dynamically</span>
            </div>
          </div>

          {/* 2. Hero Results Card - Dark Slate (Span 2) */}
          <div className="lg:col-span-2 bg-[#0F172A] text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-slate-900/15 relative overflow-hidden border border-slate-800 print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300 print:p-5 print:shadow-none print:break-inside-avoid">
            {/* Background design elements (hidden on print) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 no-print"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <span className="text-indigo-400 print:text-indigo-900 font-bold tracking-widest text-[10px] uppercase">
                Calculated Premium & Limits
              </span>
              <ShieldCheck className="h-6 w-6 text-indigo-400 opacity-50 print:text-indigo-900" />
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
                  <CurrencyInput
                    value={quoteDetails.estimatedPremium}
                    onChange={(val) => handleDetailChange("estimatedPremium", val)}
                    variant="hero"
                    placeholder="$0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Administrative / Applicant Card (Span 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-4">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              Account & Property Details
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:border-slate-200 print:rounded-none print:p-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Prepared By (Agent/Broker)</span>
                  <input
                    type="text"
                    value={quoteDetails.preparedBy}
                    onChange={(e) => handleDetailChange("preparedBy", e.target.value)}
                    placeholder="Alexis Cozzi"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none no-print"
                  />
                  <span className="hidden print:block font-bold text-slate-800 text-xs mt-0.5">{quoteDetails.preparedBy || "Alexis Cozzi"}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:border-slate-200 print:rounded-none print:p-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Quote / Estimate ID</span>
                  <input
                    type="text"
                    value={quoteDetails.quoteNumber}
                    onChange={(e) => handleDetailChange("quoteNumber", e.target.value)}
                    placeholder="CFPQ01"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none font-mono text-xs no-print"
                  />
                  <span className="hidden print:block font-mono font-bold text-slate-800 text-xs mt-0.5">{quoteDetails.quoteNumber || "CFPQ01"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:border-slate-200 print:rounded-none print:p-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Applicant / Insured Name</span>
                  <input
                    type="text"
                    value={quoteDetails.applicantName}
                    onChange={(e) => handleDetailChange("applicantName", e.target.value)}
                    placeholder="Enter Applicant Name"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none no-print"
                  />
                  <span className="hidden print:block font-bold text-slate-800 text-xs mt-0.5">{quoteDetails.applicantName || "Not Specified"}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:border-slate-200 print:rounded-none print:p-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Estimate Status</span>
                  <input
                    type="text"
                    value={quoteDetails.status}
                    onChange={(e) => handleDetailChange("status", e.target.value)}
                    placeholder="Quote Status"
                    className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none no-print"
                  />
                  <span className="hidden print:block font-bold text-slate-800 text-xs mt-0.5">{quoteDetails.status || "Preliminary Estimate"}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between print:bg-transparent print:border-b print:border-slate-200 print:rounded-none print:p-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Risk Property Address</span>
                <input
                  type="text"
                  value={quoteDetails.propertyAddress}
                  onChange={(e) => handleDetailChange("propertyAddress", e.target.value)}
                  placeholder="Enter Risk Property Address"
                  className="w-full bg-transparent font-bold text-slate-800 focus:outline-none p-0.5 border-none no-print"
                />
                <span className="hidden print:block font-bold text-slate-800 text-xs mt-0.5">{quoteDetails.propertyAddress || "Not Specified"}</span>
              </div>
            </div>
          </div>

          {/* Payment Plan & Financing Card (Span 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-500" />
                Payment Plan & Financing
              </h3>
              <span className="text-[10px] bg-indigo-50 font-bold px-2.5 py-1 rounded text-indigo-600 print:hidden">
                {(currentPlan === "monthly" || currentPlan === "mortgage") ? "16.79% Down" : "40.12% Down"}
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
                    Required Down Payment ({(currentPlan === "monthly" || currentPlan === "mortgage") ? "16.79%" : "40.12%"})
                  </span>
                  <span className="text-sm font-extrabold font-mono text-slate-900">
                    ${downPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Remaining Balance ({(currentPlan === "monthly" || currentPlan === "mortgage") ? "83.21%" : "59.88%"})
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-700">
                    ${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1 no-print">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Future Payment Structure</p>
                  
                  {currentPlan === "direct" && (
                    <div className="text-xs font-medium text-slate-600 leading-relaxed">
                      Divided into <span className="font-bold text-slate-800">2 installments</span> of <span className="font-extrabold font-mono text-indigo-700">${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> billed <span className="font-bold text-slate-800">3 months after</span>. Billed as a total of 3 payments (including the 40.12% down payment) over the year.
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
                      Requires <span className="font-semibold text-slate-900">40.12% down payment</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.4012).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>. Remaining balance divided into <span className="font-semibold text-slate-900">2 installments</span> of <span className="font-bold font-mono text-slate-900">${parseFloat(((quoteDetails.estimatedPremium - parseFloat((quoteDetails.estimatedPremium * 0.4012).toFixed(2))) / 2).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> billed <span className="font-semibold text-slate-900">3 months after</span>.
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
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
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
                          <>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                              placeholder="e.g. Other Structures"
                              className="w-full bg-transparent font-bold text-slate-800 focus:outline-none focus:bg-slate-50 px-1 py-0.5 rounded border border-transparent hover:border-slate-200 text-xs no-print"
                            />
                            <span className="hidden print:inline text-xs font-bold text-slate-800 px-1">{item.description || "Custom Coverage"}</span>
                          </>
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
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            // Auto-format raw numbers or numbers with dollar signs/commas missing
                            if (/^\d+(\.\d+)?$/.test(val)) {
                              const num = parseFloat(val);
                              handleDeductibleChange(item.id, num.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              }));
                            } else if (/^\$?\d{1,3}(,\d{3})*(\.\d+)?$/.test(val)) {
                              if (!val.startsWith("$")) {
                                handleDeductibleChange(item.id, "$" + val);
                              }
                            }
                          }}
                          placeholder="e.g. Included"
                          className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-none focus:bg-slate-50 px-1 py-0.5 rounded border border-transparent hover:border-slate-200 no-print"
                        />
                        <span className="hidden print:inline text-xs font-bold text-slate-600 px-1">{item.deductible || "Included"}</span>
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
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-4">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Policy Endorsements
            </h3>
            
            <div className="space-y-3 no-print">
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

            {/* Print-only version of Endorsements: Clean, formal checkmarks/badges */}
            <div className="hidden print:block space-y-2 text-xs">
              {endorsements.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.checked 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}>
                    {item.checked ? "✓ Included" : "✕ Not Selected"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Legal Notices & Fraud Warnings (Span 4) */}
          <div className="lg:col-span-4 bg-red-50/40 border border-red-200/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all print:bg-white print:border print:border-red-200 print:p-5 print:break-inside-avoid">
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
