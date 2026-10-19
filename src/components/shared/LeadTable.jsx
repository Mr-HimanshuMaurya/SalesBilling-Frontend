import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const CommonDropdown = ({
  value,
  options,
  placeholder = "Select",
  isOpen,
  onToggle,
  onSelect,
  width = "145px",
}) => {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  const onToggleRef = useRef(onToggle);
  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    } else {
      setMenuPos(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const clickedButton =
        buttonRef.current && buttonRef.current.contains(event.target);
      const clickedMenu =
        menuRef.current && menuRef.current.contains(event.target);

      if (!clickedButton && !clickedMenu) {
        onToggleRef.current(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const close = (event) => {
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return;
      }
      onToggleRef.current(false);
    };

    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  return (
    <div className="relative" style={{ width }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="
          flex h-9 w-full items-center justify-between gap-2
          rounded-md border border-sky-300 bg-white px-3
          text-xs font-medium text-sky-600 outline-none
          cursor-pointer transition-none focus:outline-none focus:ring-2 focus:ring-sky-100
        "
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-sky-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: Math.max(menuPos.width, 120),
              maxHeight: "220px",
              zIndex: 10,
            }}
            className="overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  onToggle(false);
                }}
                className="
                  flex w-full items-center px-3 py-2.5 text-left
                  text-xs font-medium text-gray-900 cursor-pointer
                  transition-none hover:bg-gray-100
                "
              >
                {option}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

const defaultLeads = [
  {
    id: 1,
    name: "Rahul Sharma",
    company: "Cloudedata",
    phone: "8851236965",
    email: "datacloude8@gmail.com",
    gst: "NA",
    leadType: "New Lead",
    assigned: "",
    source: "Facebook",
    lastContact: "2 days ago",
    created: "2 days ago",
    comment: "no answer",
    notes: "Try calling again tomorrow.",
  },
  {
    id: 2,
    name: "Amit Kumar",
    company: "Tech Solutions",
    phone: "9876543210",
    email: "amit@gmail.com",
    gst: "NA",
    leadType: "Follow Up",
    assigned: "",
    source: "Website",
    lastContact: "1 day ago",
    created: "3 days ago",
    comment: "Interested in demo",
    notes: "Send product demo details.",
  },
  {
    id: 3,
    name: "Priya Singh",
    company: "ABC Enterprises",
    phone: "9123456780",
    email: "priya@gmail.com",
    gst: "NA",
    leadType: "Qualified",
    assigned: "",
    source: "Referral",
    lastContact: "5 days ago",
    created: "6 days ago",
    comment: "Call back later",
    notes: "Customer asked for a callback next week.",
  },
  {
    id: 4,
    name: "Neha Verma",
    company: "Blue Peak Ltd",
    phone: "9988776655",
    email: "neha@gmail.com",
    gst: "GST-22-9988",
    leadType: "Hot Lead",
    assigned: "",
    source: "LinkedIn",
    lastContact: "Today",
    created: "1 day ago",
    comment: "Requested pricing",
    notes: "Share quote and onboarding details.",
  },
  {
    id: 5,
    name: "Sanjay Patel",
    company: "Patel & Co.",
    phone: "7894561230",
    email: "sanjay@gmail.com",
    gst: "NA",
    salesRep: "Amit",
    leadType: "Cold Lead",
    assigned: "",
    source: "Google Ads",
    lastContact: "7 days ago",
    created: "10 days ago",
    comment: "Not interested",
    notes: "Revisit after Q4 planning.",
  },
];

const assignedUsers = ["Umesh Yadav",
  "Simran Kumari",
  "Shivangi Raj",
  "Shikha Nema",
  "Sharanjit Kaur",
  "Sanjay Jana",
  "Rishabh Nautiyal",
  "Marketing cloudedata",
  "Komal Kumari",
  "Guddu Kumar",
  "Elin Tigga",
  "Divya Kashyap",
  "Dharmendra K",
  "Badal Kumar",
  "Arjun V",
  "Anandi Kumari"];

const leadTypes = [
  "International",
  "Domestic",
  "Hot Lead",
  "Cold Lead",
  "Detail Share",
  "Call Back",
  "Customer Doesn't Have Tally",
  "Not relevant",
  "Customer With Another Company",
  "Not Answered",
  "Offline",
  "Invalid",
  "Other",
];

export const LeadTable = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [leads, setLeads] = useState(defaultLeads);

  const handleDropdownToggle = useCallback((dropdownId, open) => {
    setOpenDropdown(open ? dropdownId : null);
  }, []);

  const updateLead = useCallback((leadId, field, value) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              [field]: value,
            }
          : lead
      )
    );
  }, []);

  const filteredLeads = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return leads;

    return leads.filter((lead) =>
      [
        lead.leadType,
        lead.name,
        lead.company,
        lead.phone,
        lead.email,
        lead.assigned,
        lead.source,
        lead.comment,
        lead.notes,
      ].some((field) =>
        String(field ?? "")
          .toLowerCase()
          .includes(value)
      )
    );
  }, [search, leads]);

  const handleCreateLead = () => {
    navigate("/sales/leads/create-new-lead");
  };

  const handleDownloadExcel = () => {
    const excelData = filteredLeads.map((lead, index) => ({
      "S.NO": index + 1,
      NAME: lead.name,
      COMPANY: lead.company,
      PHONE: lead.phone,
      EMAIL: lead.email,
      GST: lead.gst,
      ASSIGNED: lead.assigned,
      SOURCE: lead.source,
      "LAST CONTACT": lead.lastContact,
      CREATED: lead.created,
      COMMENT: lead.comment,
      NOTES: lead.notes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "Leads.xlsx");
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:min-w-[150px]"
            >
              <Download className="h-4 w-4" />
              Download Excel
            </button>

            {/* <button
              type="button"
              onClick={handleCreateLead}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:min-w-[138px]"
            >
              <Plus className="h-4 w-4" />
              Create New Lead
            </button> */}
          </div>
        </div>

        <div className="overflow-x-auto px-5 py-6">
          <table className="w-full min-w-[2250px] border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "S.NO",
                  "NAME",
                  "COMPANY",
                  "PHONE",
                  "EMAIL",
                  "GST",
                  "ASSIGNED",
                  "SOURCE",
                  "LAST CONTACT",
                  "CREATED",
                  "COMMENT",
                  "NOTES",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className="border-t border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-5 text-sm text-gray-700">{index + 1}</td>
                    <td className="whitespace-nowrap px-4 py-5 text-sm font-medium text-gray-800">
                      {lead.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                      {lead.company}
                    </td>
                    {/* <td className="px-4 py-5">
                      <CommonDropdown
                        value={lead.leadType}
                        options={leadTypes}
                        isOpen={openDropdown === `leadType-${lead.id}`}
                        onToggle={(open) => handleDropdownToggle(`leadType-${lead.id}`, open)}
                        onSelect={(value) => updateLead(lead.id, "leadType", value)}
                        width="145px"
                      />
                    </td> */}
                    <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                      {lead.phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                      {lead.email}
                    </td>
                    <td className="px-4 py-5 text-sm text-gray-700">{lead.gst}</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <UserRound className="h-4 w-4 text-gray-400" />
                        </div>

                        <CommonDropdown
                          value={lead.assigned}
                          options={assignedUsers}
                          isOpen={openDropdown === `assigned-${lead.id}`}
                          onToggle={(open) => handleDropdownToggle(`assigned-${lead.id}`, open)}
                          onSelect={(value) => updateLead(lead.id, "assigned", value)}
                          width="130px"
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                      {lead.source}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                      <span className="border-b border-dashed border-gray-300">
                        {lead.lastContact}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                      <span className="border-b border-dashed border-gray-300">
                        {lead.created}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                      {lead.comment}
                    </td>
                    <td className="px-4 py-5">
                      <input
                        type="text"
                        value={lead.notes || ""}
                        onChange={(e) => updateLead(lead.id, "notes", e.target.value)}
                        placeholder="Add notes..."
                        className="h-9 w-[220px] rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="px-4 py-10 text-center text-sm text-gray-500">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
