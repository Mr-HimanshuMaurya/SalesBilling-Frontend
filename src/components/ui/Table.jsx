import { Inbox } from "lucide-react";
import { Spinner } from "./Spinner";

export const Table = ({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found",
  getRowClassName,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Inbox className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-gray-50 ${
                getRowClassName ? getRowClassName(row, rowIndex) || "" : ""
              }`}
            >
              {columns.map((col) => {
                const value = col.render
                  ? col.render(row, rowIndex)
                  : row[col.key];

                return (
                  <td
                    key={col.key}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                  >
                    {value !== null && value !== undefined && value !== ""
                      ? value
                      : "NA"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
