import React, { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Phone,
  MessageCircle,
  UserRound,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import { Layout } from "../../components/layout/Layout.jsx";

const initialReminders = [
  {
    id: 1,
    leadName: "Rahul Sharma",
    company: "Sharma Traders",
    phone: "+91 98765 43210",
    type: "Call",
    title: "Follow up for demo",
    note: "Customer requested a product demo after discussing pricing.",
    date: "2026-09-28",
    time: "10:30 AM",
    priority: "High",
    status: "Today",
  },
  {
    id: 2,
    leadName: "Amit Verma",
    company: "Verma Industries",
    phone: "+91 98111 22334",
    type: "WhatsApp",
    title: "Send pricing details",
    note: "Send Pro and Pro Plus pricing details.",
    date: "2026-09-28",
    time: "12:00 PM",
    priority: "Medium",
    status: "Today",
  },
  {
    id: 3,
    leadName: "Neha Gupta",
    company: "NG Enterprises",
    phone: "+91 99585 77661",
    type: "Meeting",
    title: "Product discussion",
    note: "Discuss requirements and accounting workflow.",
    date: "2026-09-29",
    time: "11:00 AM",
    priority: "High",
    status: "Upcoming",
  },
  {
    id: 4,
    leadName: "Suresh Kumar",
    company: "Kumar Hardware",
    phone: "+91 98991 33445",
    type: "Call",
    title: "Second follow-up",
    note: "Customer was busy during previous call.",
    date: "2026-09-30",
    time: "03:30 PM",
    priority: "Low",
    status: "Upcoming",
  },
  {
    id: 5,
    leadName: "Priya Mehta",
    company: "Mehta & Sons",
    phone: "+91 98210 44556",
    type: "Call",
    title: "Renewal discussion",
    note: "Discuss renewal and additional seats.",
    date: "2026-09-27",
    time: "04:00 PM",
    priority: "High",
    status: "Overdue",
  },
  {
    id: 6,
    leadName: "Rohit Singh",
    company: "RS Distributors",
    phone: "+91 98710 99887",
    type: "WhatsApp",
    title: "Check response",
    note: "Follow up regarding quotation shared earlier.",
    date: "2026-09-26",
    time: "02:00 PM",
    priority: "Medium",
    status: "Overdue",
  },
];

const reminderTypes = ["All", "Call", "WhatsApp", "Meeting"];
const reminderStatuses = ["All", "Today", "Upcoming", "Overdue"];

const Reminder = () => {
  const [reminders, setReminders] = useState(initialReminders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const [formData, setFormData] = useState({
    leadName: "",
    company: "",
    type: "Call",
    title: "",
    note: "",
    date: "",
    time: "",
    priority: "Medium",
  });

  const todayCount = reminders.filter(
    (item) => item.status === "Today"
  ).length;

  const upcomingCount = reminders.filter(
    (item) => item.status === "Upcoming"
  ).length;

  const overdueCount = reminders.filter(
    (item) => item.status === "Overdue"
  ).length;

  const completedCount = 12;

  const filteredReminders = useMemo(() => {
    return reminders.filter((item) => {
      const matchesSearch =
        item.leadName.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        item.type === typeFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        item.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesPriority
      );
    });
  }, [
    reminders,
    search,
    statusFilter,
    typeFilter,
    priorityFilter,
  ]);

  const openAddModal = () => {
    setSelectedReminder(null);

    setFormData({
      leadName: "",
      company: "",
      type: "Call",
      title: "",
      note: "",
      date: "",
      time: "",
      priority: "Medium",
    });

    setIsModalOpen(true);
  };

  const openEditModal = (reminder) => {
    setSelectedReminder(reminder);

    setFormData({
      leadName: reminder.leadName,
      company: reminder.company,
      type: reminder.type,
      title: reminder.title,
      note: reminder.note,
      date: reminder.date,
      time: reminder.time,
      priority: reminder.priority,
    });

    setIsModalOpen(true);
  };

  const handleSaveReminder = (e) => {
    e.preventDefault();

    if (!formData.leadName || !formData.title || !formData.date) {
      return;
    }

    if (selectedReminder) {
      setReminders((current) =>
        current.map((item) =>
          item.id === selectedReminder.id
            ? {
                ...item,
                ...formData,
                status:
                  formData.date === "2026-09-28"
                    ? "Today"
                    : formData.date < "2026-09-28"
                    ? "Overdue"
                    : "Upcoming",
              }
            : item
        )
      );
    } else {
      const newReminder = {
        id: Date.now(),
        ...formData,
        status:
          formData.date === "2026-09-28"
            ? "Today"
            : formData.date < "2026-09-28"
            ? "Overdue"
            : "Upcoming",
      };

      setReminders((current) => [newReminder, ...current]);
    }

    setIsModalOpen(false);
  };

  const markCompleted = (id) => {
    setReminders((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const deleteReminder = (id) => {
    setReminders((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const getTypeIcon = (type) => {
    if (type === "WhatsApp") {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
          <MessageCircle className="h-4 w-4" />
        </div>
      );
    }

    if (type === "Meeting") {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
          <CalendarDays className="h-4 w-4" />
        </div>
      );
    }

    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Phone className="h-4 w-4" />
      </div>
    );
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "border-red-100 bg-red-50 text-red-600";
    }

    if (priority === "Medium") {
      return "border-amber-100 bg-amber-50 text-amber-600";
    }

    return "border-slate-200 bg-slate-50 text-slate-500";
  };

  const getStatusStyle = (status) => {
    if (status === "Overdue") {
      return "border-red-100 bg-red-50 text-red-600";
    }

    if (status === "Today") {
      return "border-emerald-100 bg-emerald-50 text-emerald-600";
    }

    return "border-blue-100 bg-blue-50 text-blue-600";
  };

  return (
    <Layout pageTitle="Reminder">
      <div className="min-h-full bg-slate-50 p-4 md:p-5">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Reminders
                </h1>

                <p className="mt-0.5 text-xs text-slate-500">
                  Stay on top of your sales follow-ups and customer activities.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-emerald-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-emerald-700
            "
          >
            <Plus className="h-4 w-4" />
            Add Reminder
          </button>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* TODAY */}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Today
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-800">
                  {todayCount}
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  Follow-ups scheduled
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* UPCOMING */}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Upcoming
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-800">
                  {upcomingCount}
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  Next scheduled activities
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* OVERDUE */}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Overdue
                </p>

                <h3 className="mt-2 text-2xl font-bold text-red-600">
                  {overdueCount}
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  Need immediate attention
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* COMPLETED */}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Completed
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-800">
                  {completedCount}
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  Successfully completed
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CARD
        ====================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* TOOLBAR */}

          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              {/* SEARCH */}

              <div className="relative w-full xl:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search lead, company or reminder..."
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    pl-9
                    pr-3
                    text-xs
                    text-slate-700
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-emerald-100
                  "
                />
              </div>

              {/* FILTERS */}

              <div className="flex flex-wrap items-center gap-2">
                {/* STATUS */}

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="
                      h-10
                      appearance-none
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      pl-3
                      pr-8
                      text-xs
                      text-slate-600
                      outline-none
                      focus:border-emerald-500
                    "
                  >
                    {reminderStatuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* TYPE */}

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value)
                    }
                    className="
                      h-10
                      appearance-none
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      pl-3
                      pr-8
                      text-xs
                      text-slate-600
                      outline-none
                      focus:border-emerald-500
                    "
                  >
                    {reminderTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* PRIORITY */}

                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(e.target.value)
                    }
                    className="
                      h-10
                      appearance-none
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      pl-3
                      pr-8
                      text-xs
                      text-slate-600
                      outline-none
                      focus:border-emerald-500
                    "
                  >
                    <option value="All">
                      All Priority
                    </option>
                    <option value="High">
                      High
                    </option>
                    <option value="Medium">
                      Medium
                    </option>
                    <option value="Low">
                      Low
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                  type="button"
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-xs
                    font-medium
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Lead / Customer
                  </th>

                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Reminder
                  </th>

                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Date & Time
                  </th>

                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>

                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 flex justify-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredReminders.length > 0 ? (
                  filteredReminders.map((reminder) => (
                    <tr
                      key={reminder.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* LEAD */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <UserRound className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              className="block max-w-[210px] truncate text-xs font-semibold text-slate-800 hover:text-emerald-600"
                            >
                              {reminder.leadName}
                            </button>

                            <div className="mt-0.5 max-w-[210px] truncate text-[11px] text-slate-400">
                              {reminder.company}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* REMINDER */}

                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(reminder.type)}

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800">
                              {reminder.title}
                            </div>

                            <p className="mt-1 max-w-[290px] truncate text-[11px] text-slate-400">
                              {reminder.note}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DATE */}

                      <td className="px-4 py-4">
                        <div className="text-xs font-medium text-slate-700">
                          {reminder.date}
                        </div>

                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock3 className="h-3 w-3" />
                          {reminder.time}
                        </div>
                      </td>

                      {/* TYPE */}

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {reminder.type}
                        </span>
                      </td>

                      {/* PRIORITY */}

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPriorityStyle(
                            reminder.priority
                          )}`}
                        >
                          {reminder.priority}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                            reminder.status
                          )}`}
                        >
                          {reminder.status}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Complete"
                            onClick={() =>
                              markCompleted(reminder.id)
                            }
                            className="
                              inline-flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition
                              hover:border-green-200
                              hover:bg-green-50
                              hover:text-green-600
                            "
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(reminder)
                            }
                            className="
                              inline-flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition
                              hover:border-emerald-200
                              hover:bg-emerald-50
                              hover:text-emerald-600
                            "
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              deleteReminder(reminder.id)
                            }
                            className="
                              inline-flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              border
                              border-slate-200
                              bg-white
                              text-slate-400
                              transition
                              hover:border-red-200
                              hover:bg-red-50
                              hover:text-red-600
                            "
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          {/* <button
                            type="button"
                            title="More"
                            className="
                              inline-flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-md
                              text-slate-400
                              hover:bg-slate-100
                              hover:text-slate-600
                            "
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Bell className="h-5 w-5" />
                      </div>

                      <h3 className="mt-3 text-sm font-semibold text-slate-700">
                        No reminders found
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing the filters or create a new reminder.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              Showing {filteredReminders.length} of{" "}
              {reminders.length} reminders
            </p>

         
          </div>
        </div>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  {selectedReminder
                    ? "Edit Reminder"
                    : "Add Reminder"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Schedule your next sales follow-up.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSaveReminder}
              className="p-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* LEAD NAME */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Lead / Customer
                  </label>

                  <input
                    type="text"
                    value={formData.leadName}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        leadName: e.target.value,
                      }))
                    }
                    placeholder="Enter lead name"
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>

                {/* COMPANY */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Company
                  </label>

                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        company: e.target.value,
                      }))
                    }
                    placeholder="Enter company"
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>

                {/* REMINDER TITLE */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Reminder Title
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Example: Follow up for quotation"
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>

                {/* TYPE */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Type
                  </label>

                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        type: e.target.value,
                      }))
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                    "
                  >
                    <option value="Call">
                      Call
                    </option>
                    <option value="WhatsApp">
                      WhatsApp
                    </option>
                    <option value="Meeting">
                      Meeting
                    </option>
                  </select>
                </div>

                {/* PRIORITY */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        priority: e.target.value,
                      }))
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                    "
                  >
                    <option value="High">
                      High
                    </option>
                    <option value="Medium">
                      Medium
                    </option>
                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>

                {/* DATE */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Date
                  </label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        date: e.target.value,
                      }))
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>

                {/* TIME */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Time
                  </label>

                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        time: e.target.value,
                      }))
                    }
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>

                {/* NOTE */}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Notes
                  </label>

                  <textarea
                    rows={4}
                    value={formData.note}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        note: e.target.value,
                      }))
                    }
                    placeholder="Add notes for the sales follow-up..."
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-emerald-500
                      focus:ring-2
                      focus:ring-emerald-100
                    "
                  />
                </div>
              </div>

              {/* FOOTER */}

              <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    rounded-lg
                    bg-emerald-600
                    px-5
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    hover:bg-emerald-700
                  "
                >
                  {selectedReminder
                    ? "Update Reminder"
                    : "Create Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reminder;