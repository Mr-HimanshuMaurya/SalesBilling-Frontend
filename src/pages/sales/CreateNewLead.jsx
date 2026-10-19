import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { Layout } from "../../components/layout/Layout.jsx";

const assignedOptions = [
  "Umesh Yadav",
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
  "Anandi Kumari",
];

const statusOptions = [
  "Restaurant",
  "Tally on Cloud",
  "Fairwood",
  "Bhimhost",
  "VPS Hosting",
  "CloudeData",
  "Other Converted Leads",
  "Focus on cloud",
  "Computax on cloud",
  "Marg on Cloud",
  "Busy on Cloud",
  "Jweliy on cloud",
  "School CRM",
  "SwarnApp",
  "Job",
  "Tally Offer",
  "Bookkeeper",
  "Dollar",
  "Ecommerce",
  "Website Devlopment",
  "Ecommerce Devlopment",
  "manish data",
];

const initialForm = {
  status: "",
  source: "",
  assigned: "",
  tags: "",
  name: "",
  address: "",
  position: "",
  city: "",
  email: "",
  state: "",
  website: "",
  country: "",
  phone: "",
  zipCode: "",
  leadValue: "",
  language: "System Default",
  company: "",
  description: "",
  isPublic: false,
  contactedToday: true,
  comment: "",
  remarks: "",
  interested: "",
  date: "",
};

const SearchableSelect = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Nothing selected",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt } });
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-full items-center justify-between rounded border border-slate-300 bg-white px-2.5 text-left text-xs outline-none focus:border-blue-500 ${
          value ? "text-slate-700" : "text-slate-400"
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100 p-1.5">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 w-full rounded border border-slate-200 pl-8 pr-2 text-xs outline-none focus:border-blue-500"
            />
          </div>

          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-2.5 py-2 text-xs text-slate-400">No results</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 ${
                      value === opt
                        ? "bg-indigo-50 font-medium text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const SelectField = ({
  name,
  value,
  onChange,
  children,
  placeholder = "Nothing selected",
}) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`h-9 w-full appearance-none rounded border border-slate-300 bg-white px-2.5 pr-8 text-xs outline-none focus:border-blue-500 ${
        value ? "text-slate-700" : "text-slate-800"
      }`}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
  </div>
);

const Field = ({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  className = "",
}) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-xs font-medium text-slate-700">
      {required && <span className="text-red-500">* </span>}
      {label}
    </span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="h-9 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-500"
    />
  </label>
);

const TextAreaField = ({ label, name, value, onChange, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="min-h-[60px] w-full resize-none rounded border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none focus:border-blue-500"
    />
  </label>
);

const LeadsBackdrop = ({ onCreate }) => (
  <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
      <div className="relative w-56">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          className="h-9 w-full rounded border border-slate-300 pl-9 text-xs"
          placeholder="Search leads..."
        />
      </div>
      <button
        onClick={onCreate}
        className="inline-flex h-9 items-center gap-1.5 rounded bg-indigo-600 px-3 text-xs font-medium text-white"
      >
        <Plus className="h-3.5 w-3.5" /> Create New Lead
      </button>
    </div>
    <div className="p-5">
      <div className="h-9 rounded bg-slate-50" />
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="mt-3 h-10 rounded border border-slate-100 bg-white"
        />
      ))}
    </div>
  </div>
);

const CreateNewLead = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/sales/leads");
  };

  return (
    <Layout pageTitle="All Leads">
      <LeadsBackdrop onCreate={() => {}} />

      <div className="fixed inset-0 z-40 bg-slate-900/50" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-[720px] overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex h-11 items-center justify-between border-b border-slate-200 px-3">
            <h1 className="text-xs font-semibold text-slate-800">Add New lead</h1>
            <button
              type="button"
              onClick={() => navigate("/sales/leads")}
              aria-label="Close"
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(100vh-48px)] overflow-y-auto px-5 pb-5 pt-4"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {/* Status - searchable */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-black">
                  <span className="text-red-500">* </span>Status
                </span>
                <SearchableSelect
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                  placeholder="Nothing selected"
                />
              </label>

              {/* Source */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  <span className="text-red-500">* </span>Source
                </span>
                <SelectField
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                >
                  <option value="Website">Google</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Referral">Instagram</option>
                </SelectField>
              </label>

              {/* Tags */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Tags
                </span>
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="h-9 w-full rounded border border-slate-300 px-2.5 text-xs placeholder:text-slate-800"
                  placeholder="Tag"
                />
              </label>

              {/* Assigned - searchable */}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Assigned
                </span>
                <SearchableSelect
                  name="assigned"
                  value={formData.assigned}
                  onChange={handleChange}
                  options={assignedOptions}
                  placeholder="Nothing selected"
                />
              </label>

              <Field
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Field
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <Field
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
              <Field
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <Field
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
              <Field
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
              <Field
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Country
                </span>
                <SelectField
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                </SelectField>
              </label>

              <Field
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <Field
                label="Zip Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              />

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Lead value
                </span>
                <div className="flex h-9">
                  <input
                    type="number"
                    name="leadValue"
                    value={formData.leadValue}
                    onChange={handleChange}
                    className="min-w-0 flex-1 rounded-l border border-slate-300 px-2.5 text-xs"
                  />
                  <span className="flex w-7 items-center justify-center rounded-r border border-l-0 border-slate-300 text-xs text-slate-600">
                    $
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">
                  Default Language
                </span>
                <SelectField
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="System Default">System Default</option>
                  <option value="English">English</option>
                </SelectField>
              </label>

              <Field
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />

              <Field
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-[35%] max-sm:w-[75%]"
              />

              <TextAreaField
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="col-span-2"
              />
            </div>

            <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => navigate("/sales/leads")}
                className="h-8 rounded border border-slate-200 px-3 text-xs text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                className="h-8 rounded bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateNewLead;