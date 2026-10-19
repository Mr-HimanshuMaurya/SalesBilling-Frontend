import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef(
  ({ className = "", label, options, error, disabled, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
            w-full appearance-none pl-3 pr-9 py-2 sm:py-2.5
            border rounded-lg text-sm text-gray-900 bg-white
            shadow-sm cursor-pointer
            transition-all duration-200
            hover:border-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:border-gray-300
            ${
              error
                ? "border-red-400 focus:ring-red-500/40 focus:border-red-500"
                : "border-gray-300"
            }
          `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`
            pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
            w-4 h-4 transition-colors duration-200
            ${disabled ? "text-gray-300" : "text-gray-400"}
          `}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
