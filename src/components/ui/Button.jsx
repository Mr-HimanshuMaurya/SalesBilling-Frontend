import { forwardRef } from "react";

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
      secondary:
        "border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`
        inline-flex cursor-pointer items-center justify-center gap-2 font-medium rounded-lg
        transition-colors duration-200 focus:outline-none focus:ring-2
        focus:ring-offset-2 focus:ring-indigo-500
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);
