export const TallyStatusBadge = ({ status }) => {
  const map = {
    not_pushed: {
      label: "Not Pushed",
      bg: "bg-gray-100",
      text: "text-gray-600",
    },
    pending: {
      label: "Tally Sync…",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    pushed: { label: "In Tally ✓", bg: "bg-green-100", text: "text-green-700" },
    failed: { label: "Push Failed", bg: "bg-red-100", text: "text-red-700" },
  };
  const s = map[status] || map.not_pushed;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
};
