import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = forwardRef(
  ({ className = "", label, error, prefix, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {prefix && (
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={`
  w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
  transition-colors duration-200
  ${prefix ? "pl-9" : ""}
  ${isPassword ? "pr-10" : ""}
  ${props.readOnly ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""}
  ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
