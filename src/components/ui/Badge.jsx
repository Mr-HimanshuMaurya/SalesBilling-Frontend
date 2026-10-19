import {
  STATUS_COLORS,
  STATUS_LABELS,
  ROLE_COLORS,
  ROLE_LABELS,
} from "../../utils/constants";

export const Badge = ({ variant, label }) => {
  const getClasses = () => {
    if (STATUS_COLORS[variant]) return STATUS_COLORS[variant];
    if (ROLE_COLORS[variant]) return ROLE_COLORS[variant];
    if (variant === "active") return "bg-green-100 text-green-700";
    if (variant === "inactive") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const getLabel = () => {
    if (STATUS_LABELS[variant]) return STATUS_LABELS[variant];
    if (ROLE_LABELS[variant]) return ROLE_LABELS[variant];
    if (variant === "active") return "Active";
    if (variant === "inactive") return "Inactive";
    return label;
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClasses()}`}
    >
      {getLabel()}
    </span>
  );
};
