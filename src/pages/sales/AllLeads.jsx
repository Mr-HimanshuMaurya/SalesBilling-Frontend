import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    Search,
    Plus,
    Pencil,
    UserRound,
    Download,
    ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/layout/Layout";
import * as XLSX from "xlsx";

/* =========================================================
   COMMON DROPDOWN
   Fix: menu is rendered through a portal into document.body
   and positioned with getBoundingClientRect(), so it can no
   longer be clipped by the table's `overflow-x-auto` wrapper
   (setting overflow-x to a non-visible value forces overflow-y
   to clip too, which was cutting dropdowns off on lower rows).
========================================================= */

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

    // Stabilize onToggle so effects below don't rebind every render
    const onToggleRef = useRef(onToggle);
    useEffect(() => {
        onToggleRef.current = onToggle;
    }, [onToggle]);

    // Compute menu position whenever it opens
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

    // Close on outside click
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on scroll/resize so a portaled menu never floats away
    // from the button it belongs to — but ignore scroll events that
    // originate from inside the menu itself (that's just the user
    // scrolling the options list, not the page moving underneath it).
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
            {/* Dropdown Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => onToggle(!isOpen)}
                className="
                    flex h-9 w-full
                    items-center justify-between
                    gap-2
                    rounded-md
                    border border-sky-300
                    bg-white
                    px-3
                    text-xs
                    font-medium
                    text-sky-600
                    outline-none
                    cursor-pointer
                    transition-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-sky-100
                "
            >
                <span className="truncate">
                    {value || placeholder}
                </span>

                <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-sky-500 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Portaled dropdown menu - escapes any clipped ancestor */}
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
                        className="
                            overflow-y-auto
                            rounded-md
                            border
                            border-gray-200
                            bg-white
                            shadow-xl
                        "
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
                                    flex
                                    w-full
                                    items-center
                                    px-3
                                    py-2.5
                                    text-left
                                    text-xs
                                    font-medium
                                    text-gray-900
                                    cursor-pointer
                                    transition-none
                                    hover:bg-gray-100
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

/* =========================================================
   ALL LEADS
========================================================= */

const AllLeads = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    /* Track which dropdown is open */
    const [openDropdown, setOpenDropdown] = useState(null);

    const [leads, setLeads] = useState([
        {
            id: 1,
            name: "Rahul Sharma",
            company: "Cloudedata",
            phone: "8851236965",
            email: "datacloude8@gmail.com",
            gst: "NA",
            salesRep: "Himanshu",
            leadType: "",
            assigned: "",
            status: "Active",
            source: "Facebook",
            lastContact: "2 days ago",
            created: "2 days ago",
            comment: "no answer",
            interested: "Not Answering",
            notes: "Try calling again tomorrow.",
        },
        {
            id: 2,
            name: "Amit Kumar",
            company: "Tech Solutions",
            phone: "9876543210",
            email: "amit@gmail.com",
            gst: "NA",
            salesRep: "Rahul",
            leadType: "",
            assigned: "",
            status: "Active",
            source: "Website",
            lastContact: "1 day ago",
            created: "3 days ago",
            comment: "Interested in demo",
            interested: "Interested",
            notes: "Send product demo details.",
        },
        {
            id: 3,
            name: "Priya Singh",
            company: "ABC Enterprises",
            phone: "9123456780",
            email: "priya@gmail.com",
            gst: "NA",
            salesRep: "Himanshu",
            leadType: "",
            assigned: "",
            status: "Inactive",
            source: "Referral",
            lastContact: "5 days ago",
            created: "6 days ago",
            comment: "Call back later",
            interested: "Maybe",
            notes: "Customer asked for a callback next week.",
        },
    ]);

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
        "Hot Lead",
        "Detail Share",
        "Call Back",
        "Customer Doesn't Have Tally",
        "Not relevant",
        "Customer With Another Company",
        "Not Answered",
        "Offline",
        "Invalid",
        "Other"
    ];

    const statusOptions = [
        "Active",
        "Inactive",
        "Pending",
        "Converted",
        "Lost",
    ];

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredLeads = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) {
            return leads;
        }

        return leads.filter((lead) =>
            [
                lead.leadType,
                lead.name,
                lead.company,
                lead.phone,
                lead.email,
                lead.salesRep,
                lead.assigned,
                lead.status,
                lead.source,
                lead.comment,
                lead.interested,
                lead.notes,
            ].some((field) =>
                String(field ?? "")
                    .toLowerCase()
                    .includes(value)
            )
        );
    }, [search, leads]);

    /* =====================================================
       HANDLERS
    ===================================================== */

    const handleCreateLead = () => {
        navigate("/sales/leads/create-new-lead");
    };

    // Fix: this used to just console.log the lead. Now it actually
    // navigates to an edit route, passing the lead id.
    const handleEdit = (lead) => {
        navigate(`/sales/leads/edit-lead/${lead.id}`, { state: { lead } });
    };

    // Fix: stabilized with useCallback so it doesn't create a brand
    // new function identity every render (which was causing the
    // dropdown's internal effects to rebind constantly).
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

    const handleDownloadExcel = () => {
        const excelData = filteredLeads.map((lead, index) => ({
            "S.NO": index + 1,
            NAME: lead.name,
            COMPANY: lead.company,
            "LEAD TYPE": lead.leadType,
            PHONE: lead.phone,
            EMAIL: lead.email,
            GST: lead.gst,
            "SALES REP": lead.salesRep,
            ASSIGNED: lead.assigned,
            STATUS: lead.status,
            SOURCE: lead.source,
            "LAST CONTACT": lead.lastContact,
            CREATED: lead.created,
            COMMENT: lead.comment,
            INTERESTED: lead.interested,
            NOTES: lead.notes,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "All Leads");
        XLSX.writeFile(workbook, "All-Leads.xlsx");
    };

    return (
        <Layout pageTitle="All Leads">
            <div className="w-full">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    {/* =====================================================
                       TOP TOOLBAR
                    ===================================================== */}

                    <div className="
                        flex flex-col gap-4
                        border-b border-gray-200
                        px-6 py-6
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    ">

                        {/* Search */}
                        <div className="relative w-full sm:w-[220px]">
                            <Search
                                className="
                                    absolute left-3 top-1/2
                                    h-4 w-4
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="
                                    h-10 w-full
                                    rounded-lg
                                    border border-gray-300
                                    bg-white
                                    pl-10 pr-3
                                    text-sm text-gray-700
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-100
                                "
                            />
                        </div>

                        <div className="
                            flex flex-col gap-3
                            sm:flex-row
                            sm:items-center
                        ">

                            {/* Download */}
                            <button
                                type="button"
                                onClick={handleDownloadExcel}
                                className="
                                    inline-flex h-10
                                    items-center justify-center
                                    gap-2
                                    rounded-lg
                                    border border-emerald-200
                                    bg-emerald-50
                                    px-4
                                    text-sm font-semibold
                                    text-emerald-700
                                    transition
                                    hover:bg-emerald-100
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-emerald-200
                                    sm:min-w-[150px]
                                "
                            >
                                <Download className="h-4 w-4" />
                                Download Excel
                            </button>

                            {/* Create */}
                            <button
                                type="button"
                                onClick={handleCreateLead}
                                className="
                                    inline-flex h-10
                                    items-center justify-center
                                    gap-2
                                    rounded-lg
                                    bg-indigo-600
                                    px-4
                                    text-sm font-semibold
                                    text-white
                                    transition
                                    hover:bg-indigo-700
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-indigo-200
                                    sm:min-w-[138px]
                                "
                            >
                                <Plus className="h-4 w-4" />
                                Create New Lead
                            </button>
                        </div>
                    </div>

                    {/* =====================================================
                       TABLE
                    ===================================================== */}

                    <div className="overflow-x-auto px-5 py-6">
                        <table className="
                            w-full
                            min-w-[2250px]
                            border-collapse
                        ">

                            {/* ================= HEADER ================= */}

                            <thead>
                                <tr className="bg-gray-50">
                                    {[
                                        "S.NO",
                                        "NAME",
                                        "COMPANY",
                                        "LEAD TYPE",
                                        "PHONE",
                                        "EMAIL",
                                        "GST",
                                        "SALES REP",
                                        "ASSIGNED",
                                        // "STATUS",
                                        "SOURCE",
                                        "LAST CONTACT",
                                        "CREATED",
                                        "COMMENT",
                                        // "INTERESTED",
                                        "NOTES",
                                        // "ACTIONS",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="
                                                px-4 py-3
                                                text-left
                                                text-[12px]
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-slate-500
                                            "
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* ================= BODY ================= */}

                            <tbody>
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead, index) => (
                                        <tr
                                            key={lead.id}
                                            className="
                                                border-t
                                                border-gray-100
                                                transition
                                                hover:bg-gray-50
                                            "
                                        >
                                            {/* S.NO */}
                                            <td className="px-4 py-5 text-sm text-gray-700">
                                                {index + 1}
                                            </td>

                                            {/* NAME */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm font-medium text-gray-800">
                                                {lead.name}
                                            </td>

                                            {/* COMPANY */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                {lead.company}
                                            </td>

                                            {/* LEAD TYPE */}
                                            <td className="px-4 py-5">
                                                <CommonDropdown
                                                    value={lead.leadType}
                                                    options={leadTypes}
                                                    isOpen={
                                                        openDropdown ===
                                                        `leadType-${lead.id}`
                                                    }
                                                    onToggle={(open) =>
                                                        handleDropdownToggle(
                                                            `leadType-${lead.id}`,
                                                            open
                                                        )
                                                    }
                                                    onSelect={(value) =>
                                                        updateLead(
                                                            lead.id,
                                                            "leadType",
                                                            value
                                                        )
                                                    }
                                                    width="145px"
                                                />
                                            </td>

                                            {/* PHONE */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                {lead.phone}
                                            </td>

                                            {/* EMAIL */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                {lead.email}
                                            </td>

                                            {/* GST */}
                                            <td className="px-4 py-5 text-sm text-gray-700">
                                                {lead.gst}
                                            </td>

                                            {/* SALES REP */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                {lead.salesRep}
                                            </td>

                                            {/* ASSIGNED */}
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                                        <UserRound className="h-4 w-4 text-gray-400" />
                                                    </div>

                                                    <CommonDropdown
                                                        value={lead.assigned}
                                                        options={assignedUsers}
                                                        isOpen={
                                                            openDropdown ===
                                                            `assigned-${lead.id}`
                                                        }
                                                        onToggle={(open) =>
                                                            handleDropdownToggle(
                                                                `assigned-${lead.id}`,
                                                                open
                                                            )
                                                        }
                                                        onSelect={(value) =>
                                                            updateLead(
                                                                lead.id,
                                                                "assigned",
                                                                value
                                                            )
                                                        }
                                                        width="130px"
                                                    />
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            {/* <td className="px-4 py-5">
                                                <CommonDropdown
                                                    value={lead.status}
                                                    options={statusOptions}
                                                    isOpen={
                                                        openDropdown ===
                                                        `status-${lead.id}`
                                                    }
                                                    onToggle={(open) =>
                                                        handleDropdownToggle(
                                                            `status-${lead.id}`,
                                                            open
                                                        )
                                                    }
                                                    onSelect={(value) =>
                                                        updateLead(
                                                            lead.id,
                                                            "status",
                                                            value
                                                        )
                                                    }
                                                    width="120px"
                                                />
                                            </td> */}

                                            {/* SOURCE */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                {lead.source}
                                            </td>

                                            {/* LAST CONTACT */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                <span className="border-b border-dashed border-gray-300">
                                                    {lead.lastContact}
                                                </span>
                                            </td>

                                            {/* CREATED */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                <span className="border-b border-dashed border-gray-300">
                                                    {lead.created}
                                                </span>
                                            </td>

                                            {/* COMMENT */}
                                            <td className="whitespace-nowrap px-4 py-5 text-sm text-gray-700">
                                                {lead.comment}
                                            </td>

                                            {/* INTERESTED */}
                                            {/* <td className="max-w-[140px] px-4 py-5 text-sm text-gray-700">
                                                <span className="block whitespace-normal">
                                                    {lead.interested}
                                                </span>
                                            </td> */}

                                            {/* NOTES */}
                                            <td className="px-4 py-5">
                                                <input
                                                    type="text"
                                                    value={lead.notes || ""}
                                                    onChange={(e) =>
                                                        updateLead(
                                                            lead.id,
                                                            "notes",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Add notes..."
                                                    className="
                                                        h-9
                                                        w-[220px]
                                                        rounded-md
                                                        border
                                                        border-gray-300
                                                        bg-white
                                                        px-3
                                                        text-xs
                                                        text-gray-700
                                                        outline-none
                                                        placeholder:text-gray-400
                                                        focus:border-indigo-500
                                                        focus:ring-2
                                                        focus:ring-indigo-100
                                                    "
                                                />
                                            </td>

                                            {/* ACTIONS */}
                                            {/* <td className="px-4 py-5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(lead)
                                                    }
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        justify-center
                                                        rounded-md
                                                        p-2
                                                        text-gray-500
                                                        transition
                                                        hover:bg-gray-100
                                                        hover:text-indigo-600
                                                    "
                                                    title="Edit Lead"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="17"
                                            className="px-4 py-10 text-center text-sm text-gray-500"
                                        >
                                            No leads found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AllLeads;