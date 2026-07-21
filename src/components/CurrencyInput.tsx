import React, { useState, useEffect } from "react";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  bold?: boolean;
  variant?: "standard" | "hero";
}

export const formatLiveCurrency = (val: string | number): { formatted: string; numValue: number } => {
  if (typeof val === "number") {
    if (val === 0) return { formatted: "", numValue: 0 };
    const formatted = val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return { formatted, numValue: val };
  }

  const clean = val.replace(/[^0-9.]/g, "");
  if (!clean) return { formatted: "", numValue: 0 };

  const parts = clean.split(".");
  const intPart = parts[0];
  const decPart = parts.length > 1 ? parts.slice(1).join("").slice(0, 2) : null;

  const intNum = parseInt(intPart || "0", 10);
  const formattedInt = isNaN(intNum) ? "0" : intNum.toLocaleString("en-US");

  let formatted = `$${formattedInt}`;
  if (decPart !== null) {
    formatted += `.${decPart}`;
  }

  const parsedNum = parseFloat(decPart !== null ? `${intNum}.${decPart}` : `${intNum}`);
  return { formatted, numValue: isNaN(parsedNum) ? 0 : parsedNum };
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "$0.00",
  className = "",
  bold = false,
  variant = "standard",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const formatValue = (num: number): string => {
    if (num === 0) return "";
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatValue(value));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (value === 0) {
      setInputValue("");
    } else {
      setInputValue(formatValue(value));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const { formatted, numValue } = formatLiveCurrency(inputValue);
    onChange(numValue);
    setInputValue(formatted || (value > 0 ? formatValue(value) : ""));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const { formatted, numValue } = formatLiveCurrency(rawValue);
    setInputValue(formatted);
    onChange(numValue);
  };

  const inputClass = variant === "hero"
    ? `w-36 bg-transparent text-indigo-300 print:text-indigo-950 font-mono font-bold text-lg border border-transparent hover:border-slate-700/50 focus:border-indigo-400 focus:outline-none px-1 py-0.5 rounded transition-all text-center ${className}`
    : `w-full bg-transparent px-2 py-1 rounded transition-all duration-150 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 border border-transparent hover:border-gray-300 md:text-sm ${
        bold ? "font-bold text-gray-900" : "text-gray-700"
      } ${className}`;

  return (
    <>
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${inputClass} print:hidden`}
      />
      <span className={`hidden print:inline font-mono ${
        variant === "hero" ? "text-indigo-950 font-bold text-lg" : bold ? "font-bold text-slate-900" : "text-slate-800"
      } ${className}`}>
        {inputValue || placeholder}
      </span>
    </>
  );
};
