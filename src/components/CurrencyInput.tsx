import React, { useState, useEffect } from "react";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  bold?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "$0.00",
  className = "",
  bold = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Format number to currency string: e.g. 150000 -> "$150,000" or "$150,000.00"
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
    // Show raw number on focus for easier editing: e.g. 150000
    setInputValue(value === 0 ? "" : value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Clean up input value and update
    const parsed = parseFloat(inputValue.replace(/[^0-9.]/g, ""));
    const finalVal = isNaN(parsed) ? 0 : parsed;
    onChange(finalVal);
    setInputValue(formatValue(finalVal));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Allow digits and one decimal point only
    const cleanValue = rawValue.replace(/[^0-9.]/g, "");
    
    // Ensure only one decimal point
    const parts = cleanValue.split(".");
    const formatted = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join("")}` 
      : cleanValue;

    setInputValue(formatted);

    // Call onChange with parsed value in real-time if valid
    const parsed = parseFloat(formatted);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  return (
    <input
      id={id}
      type="text"
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full bg-transparent px-2 py-1 rounded transition-all duration-150 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 border border-transparent hover:border-gray-300 md:text-sm ${
        bold ? "font-bold text-gray-900" : "text-gray-700"
      } ${className}`}
    />
  );
};
