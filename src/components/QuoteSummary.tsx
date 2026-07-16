import React, { useMemo } from "react";
import { 
  Shield, 
  FileText, 
  Coins, 
  Calendar, 
  ArrowRight, 
  Info, 
  CheckCircle, 
  Printer, 
  Building,
  AlertTriangle,
  Mail,
  FileCheck,
  Check,
  Percent,
  Calculator,
  User,
  MapPin,
  ClipboardList
} from "lucide-react";

interface QuoteSummaryProps {
  quoteDetails: {
    clientName: string;
    propertyAddress: string;
    estimatedPremium: number;
    fireCounty: string;
    insuringCarrier: string;
    coverageA: number;
    coverageB: number;
    coverageC: number;
    coverageD: number;
    coverageE: number;
    deductible: number;
  };
  coverages: Array<{
    id: string;
    name: string;
    limit: string | number;
    premium: number;
    selected: boolean;
    category: string;
    description: string;
    mandatory?: boolean;
  }>;
  currentPlan: "monthly" | "direct" | "mortgage";
  onPlanChange: (plan: "monthly" | "direct" | "mortgage") => void;
  onAdjustCoverages?: () => void;
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  quoteDetails,
  coverages,
  currentPlan,
  onPlanChange,
  onAdjustCoverages
}) => {
  const selectedOptionalCoverages = useMemo(() => {
    return coverages.filter(c => c.selected && !c.mandatory);
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
  }, [remainingBalance, currentPlan, quoteDetails.estimatedPremium]);

  const baseFirePremium = useMemo(() => {
    const mandatory = coverages.find(c => c.mandatory);
    return mandatory ? mandatory.premium : 0;
  }, [coverages]);

  const optionalCoveragesTotal = useMemo(() => {
    return selectedOptionalCoverages.reduce((sum, c) => sum + c.premium, 0);
  }, [selectedOptionalCoverages]);

  const handlePrint = () => {
    window.print();
  };

  const copyEstimateText = () => {
    const text = `
=========================================
CA FAIR PLAN PRELIMINARY ESTIMATE
=========================================
Client Name: ${quoteDetails.clientName}
Property Address: ${quoteDetails.propertyAddress}
Insuring Carrier: ${quoteDetails.insuringCarrier} (CA FAIR Plan Association)
County Risk Class: ${quoteDetails.fireCounty}

ESTIMATED ANNUAL PREMIUM: $${quoteDetails.estimatedPremium.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

COVERAGE LIMITS:
-----------------------------------------
- Dwelling (Cov A): $${quoteDetails.coverageA.toLocaleString()}
- Other Structures (Cov B): $${quoteDetails.coverageB.toLocaleString()}
- Personal Property (Cov C): $${quoteDetails.coverageC.toLocaleString()}
- Fair Rental Value (Cov D): $${quoteDetails.coverageD.toLocaleString()}
- Additional Living Expense (Cov E): $${quoteDetails.coverageE.toLocaleString()}
- Deductible Option: $${quoteDetails.deductible.toLocaleString()}

SELECTED OPTIONAL ENDORSEMENTS:
-----------------------------------------
${selectedOptionalCoverages.length > 0 
  ? selectedOptionalCoverages.map(c => `- ${c.name} ($${c.premium}/yr)`).join("\n")
  : "None selected (Basic Fire Coverage Only)"
}

ESTIMATED PAYMENT & FINANCING PLAN:
-----------------------------------------
Selected Plan: ${
  currentPlan === "monthly" 
    ? "Monthly Installment Plan (12-Pay)" 
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
    `;
    
    navigator.clipboard.writeText(text);
    alert("Estimate copy formatted and saved to your clipboard!");
  };

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4 print:p-0">
      {/* Header Info Block */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden print:bg-transparent print:text-slate-900 print:shadow-none print:p-0 print:border-b print:border-slate-200 print:rounded-none">
        {/* Background decorative element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 print:hidden" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-400/20 print:border-slate-300 print:text-slate-700">
                Preliminary Insurance Illustration
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              CA FAIR Plan Premium Estimate
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed print:text-slate-500">
              This summary details the estimated dwelling limits, included endorsements, county-level risk adjustments, and available installment arrangements.
            </p>
          </div>

          <div className="flex gap-2.5 w-full md:w-auto print:hidden">
            <button
              onClick={copyEstimateText}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700/80 transition"
            >
              <ClipboardList className="w-4 h-4" />
              Copy Text
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/15"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Quick Meta Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800 print:grid-cols-3 print:border-slate-200 print:mt-4 print:pt-4">
          <div className="flex items-center gap-3.5 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 print:bg-transparent print:border-none print:p-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 print:hidden">
              <User className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-slate-500">Applicant</p>
              <p className="text-sm font-extrabold text-white print:text-slate-900">{quoteDetails.clientName || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 print:bg-transparent print:border-none print:p-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 print:hidden">
              <MapPin className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-slate-500">Risk Address</p>
              <p className="text-sm font-extrabold text-white truncate max-w-[180px] sm:max-w-none print:text-slate-900">{quoteDetails.propertyAddress || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 print:bg-transparent print:border-none print:p-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 print:hidden">
              <Shield className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-slate-500">Risk County</p>
              <p className="text-sm font-extrabold text-white print:text-slate-900">{quoteDetails.fireCounty} County</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Quote Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:grid-cols-1 print:gap-4">
        
        {/* Left Side: Summary of Coverages */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 space-y-5 shadow-sm print:shadow-none print:border-none print:p-0">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:pb-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600 print:hidden" />
                Coverage & Endorsement Schedule
              </h3>
              {onAdjustCoverages && (
                <button 
                  onClick={onAdjustCoverages} 
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 print:hidden"
                >
                  Edit Coverages
                </button>
              )}
            </div>

            {/* Core Fire Risk Limits */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Section I: Core Fire Hazards (Structure/Contents)</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 print:bg-transparent print:border print:border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Coverage A: Dwelling Limit</span>
                  <span className="text-sm font-extrabold text-slate-800 block">${quoteDetails.coverageA.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 print:bg-transparent print:border print:border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Coverage B: Other Structures (10% standard)</span>
                  <span className="text-sm font-extrabold text-slate-800 block">${quoteDetails.coverageB.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 print:bg-transparent print:border print:border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Coverage C: Personal Property (Contents)</span>
                  <span className="text-sm font-extrabold text-slate-800 block">${quoteDetails.coverageC.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 print:bg-transparent print:border print:border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Deductible Selection</span>
                  <span className="text-sm font-extrabold text-slate-800 block">${quoteDetails.deductible.toLocaleString()} Deductible</span>
                </div>
              </div>
            </div>

            {/* Selected Optional Endorsements */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Section II: Additional Extended Coverages & Endorsements</h4>
              
              <div className="space-y-2.5">
                {selectedOptionalCoverages.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-center leading-relaxed">
                    No optional endorsements selected. This estimate represents standard basic fire coverage only.
                  </div>
                ) : (
                  selectedOptionalCoverages.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50 transition-colors hover:bg-slate-50/80 print:bg-transparent print:border print:border-slate-200 print:p-2"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 print:hidden" />
                          <span className="text-xs font-bold text-slate-800">{item.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-slate-700 block">${item.premium.toLocaleString()}</span>
                        <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">included</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Underwriting Caveats and Next Steps */}
          <div className="bg-amber-50/40 rounded-3xl border border-amber-100/80 p-5 space-y-3.5 print:bg-transparent print:border-slate-200 print:p-4">
            <h4 className="text-xs font-extrabold text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 print:hidden" />
              Underwriting Disclaimers & Fair Plan Process
            </h4>
            <div className="text-[11px] text-amber-900/80 space-y-2 leading-relaxed">
              <p>
                <span className="font-bold text-amber-950">This is a dynamic calculation tool, not a formal policy binder.</span> The CA FAIR Plan requires all applications to undergo full underwriting prior to binding. County-level wildfire risk scoring, clearing space inspections, and property-specific eligibility can cause final bound premiums to fluctuate from this estimate.
              </p>
              <p>
                To officially bind a CA FAIR Plan policy, a licensed CA insurance agent or broker must submit this schedule via the online CA FAIR Plan broker portal, upload recent property photographs, and issue the exact selected down payment.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Pricing summary and Financing selection */}
        <div className="lg:col-span-5 space-y-6 print:space-y-4">
          
          {/* Main Price Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-950 relative overflow-hidden print:bg-transparent print:text-slate-900 print:border print:border-slate-200 print:shadow-none print:p-5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12 print:hidden" />
            
            <div className="space-y-4 relative">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-200/80 print:text-slate-500">Premium Estimate</span>
                <span className="text-[10px] uppercase font-black tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/10 print:border-slate-200 print:text-slate-700">Annualized</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-indigo-100/60 font-medium print:text-slate-500">Total Est. Premium</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
                    ${quoteDetails.estimatedPremium.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-indigo-200/60 font-medium print:text-slate-500">/ yr</span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2.5 pt-4 border-t border-indigo-950/80 text-xs print:border-slate-200">
                <div className="flex justify-between text-indigo-200/70 print:text-slate-500">
                  <span>Base Fire Coverage</span>
                  <span className="font-mono text-white font-semibold print:text-slate-800">${baseFirePremium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-indigo-200/70 print:text-slate-500">
                  <span>Optional Endorsements ({selectedOptionalCoverages.length})</span>
                  <span className="font-mono text-white font-semibold print:text-slate-800">+${optionalCoveragesTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-indigo-200/70 print:text-slate-500">
                  <span>Wildfire Surcharge Rating</span>
                  <span className="font-mono text-white font-semibold print:text-slate-800">Included in Base</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Plan Picker */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 space-y-6 shadow-sm print:shadow-none print:border-none print:p-0">
            <div className="space-y-1.5">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Payment Plan & Financing
                </h3>
                <span className="text-[10px] bg-indigo-50 font-bold px-2.5 py-1 rounded text-indigo-600 print:hidden">
                  {(currentPlan === "monthly" || currentPlan === "mortgage") ? "16.79% Down" : "40.12% Down"}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Choose the billing option matching your cashflow or mortgage escrow guidelines.
              </p>
            </div>

            {/* Plan Options Selector Tabs */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-100 p-1.5 rounded-2xl print:hidden">
              <button
                type="button"
                onClick={() => onPlanChange("monthly")}
                className={`text-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  currentPlan === "monthly"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                12-Pay (Monthly)
              </button>
              <button
                type="button"
                onClick={() => onPlanChange("direct")}
                className={`text-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  currentPlan === "direct"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                3-Pay (Direct)
              </button>
              <button
                type="button"
                onClick={() => onPlanChange("mortgage")}
                className={`text-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  currentPlan === "mortgage"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Mortgage Escrow
              </button>
            </div>

            {/* Plan Specific Calculation */}
            <div className="space-y-4">
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
              </div>

              {/* Dynamic Explanatory Text */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-indigo-50 text-indigo-600 mt-0.5 print:hidden">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  
                  {currentPlan === "monthly" && (
                    <div className="text-xs font-medium text-slate-600 leading-relaxed">
                      Divided into <span className="font-bold text-slate-800">11 monthly installments</span> of <span className="font-extrabold font-mono text-indigo-700">${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (each representing 8.45% of the total premium). Billed directly to the insured.
                    </div>
                  )}

                  {currentPlan === "direct" && (
                    <div className="text-xs font-medium text-slate-600 leading-relaxed">
                      Divided into <span className="font-bold text-slate-800">2 installments</span> of <span className="font-extrabold font-mono text-indigo-700">${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> billed <span className="font-bold text-slate-800">3 months after</span>. Billed as a total of 3 payments (including the 40.12% down payment) over the year.
                    </div>
                  )}

                  {currentPlan === "mortgage" && (
                    <div className="text-xs font-medium text-indigo-900 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 leading-relaxed">
                      To utilize Mortgage Escrow, you <span className="font-bold">start the monthly plan</span> (requiring a <span className="font-bold">{downPayment ? "16.79%" : ""} down payment</span> of <span className="font-extrabold text-slate-900">${downPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>). After setup, you can <span className="font-bold">bill the remaining payments</span> (11 installments of <span className="font-bold font-mono text-indigo-700">${installmentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> each) to your mortgage company and <span className="font-bold">they will take over future payments</span>. You pay it together with your mortgage payments.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Print Friendly Billing Block */}
            <div className="hidden print:block border-t border-slate-200 pt-3.5 space-y-3.5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">CA FAIR Plan Installment Schedule</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Option 1: Direct Installment Plan (3-Pay)</p>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Requires <span className="font-semibold text-slate-900">40.12% down payment</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.4012).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>. Remaining balance divided into <span className="font-semibold text-slate-900">2 installments</span> of <span className="font-bold font-mono text-slate-900">${parseFloat(((quoteDetails.estimatedPremium - parseFloat((quoteDetails.estimatedPremium * 0.4012).toFixed(2))) / 2).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> billed <span className="font-semibold text-slate-900">3 months after</span>.
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">Option 2: Monthly Installment Plan (12-Pay)</p>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Requires <span className="font-semibold text-slate-900">16.79% down payment</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.1679).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>. Remaining balance divided into <span className="font-semibold text-slate-900">11 monthly installments</span> of <span className="font-bold font-mono text-slate-900">${parseFloat((quoteDetails.estimatedPremium * 0.0845).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> (8.45% of premium each) billed monthly.
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
      </div>
    </div>
  );
};
