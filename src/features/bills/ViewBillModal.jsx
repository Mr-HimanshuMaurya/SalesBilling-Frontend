import { useState } from "react";
import { Download } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";

// ─── Constants (same as pdfGenerator.js) ───────────────────────────────────
const companyInfo = {
  companyName: "ASHATHA ENTERPRISES",
  addressLine1: "B-5 Jyoti building,66 behind icici bank",
  addressLine2: "Nehru place delhi",
  cityPincode: "Delhi-110019",
  // gstin: "07AALCP3083C1ZH",
  stateName: "Delhi",
  stateCode: "07",
  // cin: "U74999DL2020PTC367460",
  email: "shakshisingh1501990@gmail.com",
  // website: "www.cloudedata.com",
  bankAccountHolder: "Ashatha ENTERPRISES",
  bankName: "Axis Bank",
  bankAccountNumber: "923010044616794",
  bankBranch: "Boisar (Boisor)",
  bankIFSC: "UTIB0001291",
  jurisdiction: "DELHI",
};

const SERVICE_HSN = {
  Printer: "84439990",
};

const SERVICE_NAMES = {
  Printer: "Printer",
};

const GST_RATE = 18;

// ─── Helpers ────────────────────────────────────────────────────────────────
const numberToWords = (num) => {
  if (num === 0) return "Zero";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  if (num < 20) return ones[num];
  if (num < 100)
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000)
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " and " + numberToWords(num % 100) : "")
    );
  if (num < 100000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 ? " " + numberToWords(num % 1000) : "")
    );
  if (num < 10000000)
    return (
      numberToWords(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 ? " " + numberToWords(num % 100000) : "")
    );
  return (
    numberToWords(Math.floor(num / 10000000)) +
    " Crore" +
    (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
  );
};

const amountInWords = (amount) => {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = numberToWords(rupees) + " Rupees";
  if (paise > 0) words += " and " + numberToWords(paise) + " Paise";
  return words + " Only";
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate2D = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const formatDateShort = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── Shared cell style ──────────────────────────────────────────────────────
const td = (extra = {}) => ({
  border: "1px solid #aaa",
  padding: "5px 6px",
  fontSize: 11,
  ...extra,
});

const EXCLUDED_KEYS = [
  "quantity",
  "amount",
  "billing date",
  "renewal date",
  "billingdate",
  "renewaldate",
];

// ─── Component ───────────────────────────────────────────────────────────────
export const ViewBillModal = ({ isOpen, onClose, bill, userRole }) => {
  const [adminPreviewType, setAdminPreviewType] = useState("tax");

  if (!bill) return null;

  const isProformaPreview = bill.adminDirectBill
    ? adminPreviewType === "proforma"
    : bill.status === "draft";

  const baseAmount = parseFloat(bill.amount) || 0;
  const gstType = ["IGST", "CGST_SGST", "NO_GST"].includes(bill.gstType)
    ? bill.gstType
    : "IGST";
  const isSplitGst = gstType === "CGST_SGST";
  const isNoGst = gstType === "NO_GST";
  const cgstAmount = isSplitGst
    ? parseFloat(((baseAmount * 9) / 100).toFixed(2))
    : 0;
  const sgstAmount = isSplitGst
    ? parseFloat(((baseAmount * 9) / 100).toFixed(2))
    : 0;
  const igstAmount =
    gstType === "IGST"
      ? parseFloat(((baseAmount * GST_RATE) / 100).toFixed(2))
      : 0;
  const gstAmount = isSplitGst ? cgstAmount + sgstAmount : igstAmount;
  const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));
  const roundedTotal = Math.round(totalAmount);
  const roundOff = roundedTotal - totalAmount;

  const hsnCode = SERVICE_HSN[bill.service] || "998315";
  const serviceName = SERVICE_NAMES[bill.service] || bill.service;
  const client = bill.client;
  const lineItems = Array.isArray(bill.lineItems) ? bill.lineItems : [];
  const hasLineItems = lineItems.length > 0;

  const qSpec = bill.specifications?.find(
    (s) => s.key.toLowerCase() === "quantity",
  );
  const qtyLabel = hasLineItems
    ? `${String(
        lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
      ).padStart(2, "0")} Nos.`
    : qSpec
      ? `${qSpec.value} No.`
      : "1 No.";

  const filteredSpecs =
    bill.specifications?.filter(
      (s) => !EXCLUDED_KEYS.includes(s.key.toLowerCase().replace(/\s/g, "")),
    ) || [];

  const handleDownloadPdf = (type) => {
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      "https://salesbilling-backend.onrender.com";
    const suffix = bill.adminDirectBill
      ? `?type=${type || adminPreviewType || "tax"}`
      : "";
    window.open(`${baseUrl}/api/pdf/${bill._id}${suffix}`, "_blank");
  };

  const fillerTd = {
    borderLeft: "1px solid #aaa",
    borderRight: "1px solid #aaa",
    padding: 0,
    height: 18,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice" size="xl">
      {/* ── Toolbar ── */}

      {userRole === "sales" ? (
        ""
      ) : (
        <div className="flex flex-wrap justify-end gap-2 mb-4">
          {bill.adminDirectBill && userRole === "superadmin" && (
            <div className="flex rounded-lg border border-gray-200 p-0.5 mr-auto">
              <button
                type="button"
                onClick={() => setAdminPreviewType("proforma")}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  adminPreviewType === "proforma"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Proforma
              </button>
              <button
                type="button"
                onClick={() => setAdminPreviewType("tax")}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  adminPreviewType === "tax"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tax Invoice
              </button>
            </div>
          )}
          {bill.adminDirectBill && userRole === "superadmin" ? (
            <>
              <Button
                variant="secondary"
                onClick={() => handleDownloadPdf("proforma")}
              >
                <Download className="w-4 h-4 mr-1" />
                Proforma PDF
              </Button>
              <Button onClick={() => handleDownloadPdf("tax")}>
                <Download className="w-4 h-4 mr-1" />
                Tax Invoice PDF
              </Button>
            </>
          ) : (
            <Button onClick={() => handleDownloadPdf()}>
              <Download className="w-4 h-4 mr-1" />
              Download PDF
            </Button>
          )}
        </div>
      )}

      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 11,
          color: "#1e293b",
          background: "#fff",
          padding: "20px 24px",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
        }}
      >
        {/* Header: Logo + Title */}
        <div
          style={{
            position: "relative",
            marginBottom: 8,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/aasthalogo.png"
            alt="Logo"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 40,
              width: "auto",
            }}
          />
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#1e293b",
            }}
          >
            {isProformaPreview ? "Proforma Invoice" : "Tax Invoice"}
          </div>
        </div>

        {/* {bill.status === "approved" && (
          <div
            style={{
              position: "absolute",
              bottom: "25px",
              right: "25px",
              transform: "rotate(-20deg)",
              zIndex: 10,
              pointerEvents: "none",
              border: "5px solid #16a34a",
              borderRadius: 12,
              padding: "10px 28px",
              textAlign: "center",
              opacity: 0.2,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: "#16a34a",
                letterSpacing: 4,
                lineHeight: 1,
              }}
            >
              PAID
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#16a34a",
                letterSpacing: 1,
              }}
            >
              APPROVED
            </div>
          </div>
        )} */}

        {/* ── Top Grid: Company + Invoice Meta ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: "1px solid #ccc",
          }}
        >
          {/* Left: Company info */}
          <div
            style={{
              padding: "8px 10px",
              fontSize: 10.5,
              lineHeight: 1.55,
              borderRight: "1px solid #ccc",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
              {companyInfo.companyName}
            </div>
            <div>
              {companyInfo.addressLine1}, {companyInfo.addressLine2}
            </div>
            <div>{companyInfo.cityPincode}</div>

            <div>
              State: {companyInfo.stateName} | Code: {companyInfo.stateCode}
            </div>
            <div>Phone: 9076713270</div>
            <div>Email: {companyInfo.email}</div>
          </div>
          {/* Right: Invoice meta */}
          <div
            style={{ padding: "8px 10px", fontSize: 10.5, lineHeight: 1.55 }}
          >
            {[
              // ["Invoice No.", bill.billNumber],
              [
                "Invoice No.",
                isProformaPreview ? "Proforma Invoice" : bill.billNumber,
              ],
              ["Billing Date", formatDateShort(bill.billingDate)],
              ["Renewal Date", formatDateShort(bill.renewalDate)],
              ["Service", serviceName],
            ].map(([label, val]) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bill To ── */}
        <div
          style={{
            border: "1px solid #ccc",
            borderTop: "none",
            padding: "4px 6px",
            fontSize: 10.5,
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#64748b",
              letterSpacing: 0.4,
              marginBottom: 4,
            }}
          >
            Bill To
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {client?.companyName}
          </div>
          <div>
            Representative: <strong>{client?.representativeName}</strong>
          </div>
          {}
          {client?.phone && <div>Phone: {client.phone}</div>}
          {client?.email && <div>Email: {client.email}</div>}
          {client?.gstNumber && (
            <div>
              GSTIN: <strong>{client.gstNumber}</strong>
            </div>
          )}
          {client?.address && <div>Address: {client?.address}</div>}
        </div>

        {/* ── Tally-Style Items Table ── */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 8,
            fontSize: 11,
          }}
        >
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {[
                { label: "Sl\nNo.", w: "5%", align: "center" },
                {
                  label: "Description of\nServices",
                  w: "36%",
                  align: "center",
                },
                { label: "GST\nRate", w: "7%", align: "center" },
                { label: "Quantity", w: "10%", align: "center" },
                { label: "Rate", w: "12%", align: "right" },
                { label: "per", w: "6%", align: "center" },
                { label: "Amount", w: "14%", align: "right" },
              ].map(({ label, w, align }) => (
                <th
                  key={label}
                  style={{
                    border: "1px solid #aaa",
                    padding: "5px 6px",
                    textAlign: align,
                    width: w,
                    fontSize: 10,
                    whiteSpace: "pre-line",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasLineItems ? (
              lineItems.map((item, index) => {
                const qty = Number(item.quantity) || 0;
                const rate = Number(item.rate) || 0;
                const amount = Number(item.amount) || qty * rate;
                return (
                  <tr key={index}>
                    <td style={{ ...td(), textAlign: "center" }}>
                      {index + 1}
                    </td>
                    <td style={{ ...td() }}>
                      <div style={{ fontWeight: 700 }}>{item.description}</div>
                    </td>
                    <td style={{ ...td(), textAlign: "center" }}>
                      {isNoGst ? 0 : GST_RATE}%
                    </td>
                    <td style={{ ...td(), textAlign: "center" }}>
                      {String(qty).padStart(2, "0")} Nos.
                    </td>
                    <td style={{ ...td(), textAlign: "right" }}>
                      {formatINR(rate)}
                    </td>
                    <td style={{ ...td(), textAlign: "center" }}>Nos.</td>
                    <td
                      style={{ ...td(), textAlign: "right", fontWeight: 700 }}
                    >
                      {formatINR(amount)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <>
                <tr>
                  <td style={{ ...td(), textAlign: "center" }}>1</td>
                  <td style={{ ...td() }}>
                    <div style={{ fontWeight: 700 }}>{serviceName}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>
                      From {formatDate2D(bill.billingDate)} to{" "}
                      {formatDate2D(bill.renewalDate)}
                    </div>
                  </td>
                  <td style={{ ...td(), textAlign: "center" }}>
                    {isNoGst ? 0 : GST_RATE}%
                  </td>
                  <td style={{ ...td(), textAlign: "center" }}>{qtyLabel}</td>
                  <td style={{ ...td(), textAlign: "right" }}>
                    {formatINR(baseAmount)}
                  </td>
                  <td style={{ ...td(), textAlign: "center" }}>No.</td>
                  <td style={{ ...td(), textAlign: "right", fontWeight: 700 }}>
                    {formatINR(baseAmount)}
                  </td>
                </tr>
                {filteredSpecs.map((s, i) => (
                  <tr key={i} style={{ background: "#fafafa" }}>
                    <td
                      style={{
                        borderLeft: "1px solid #aaa",
                        borderRight: "1px solid #aaa",
                        padding: "3px 6px",
                      }}
                    />
                    <td
                      style={{
                        borderRight: "1px solid #aaa",
                        padding: "3px 6px 3px 18px",
                        fontSize: 10.5,
                        color: "#333",
                      }}
                    >
                      {s.key}
                      {s.value ? ` - ${s.value}` : ""}
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} style={{ borderRight: "1px solid #aaa" }} />
                    ))}
                  </tr>
                ))}
              </>
            )}

            {/* Filler rows */}
            {Array(Math.max(2, 6 - (hasLineItems ? lineItems.length : 1)))
              .fill(null)
              .map((_, i) => (
                <tr key={`f${i}`} style={{ height: 18 }}>
                  <td style={fillerTd} />
                  <td style={fillerTd} />
                  <td style={fillerTd} />
                  <td style={fillerTd} />
                  <td style={fillerTd} />
                  <td style={fillerTd} />
                  <td style={fillerTd} />
                </tr>
              ))}

            {isSplitGst ? (
              <>
                <tr>
                  <td
                    style={{
                      borderLeft: "1px solid #aaa",
                      borderRight: "1px solid #aaa",
                      borderTop: "1px solid #aaa",
                      padding: "5px 6px",
                    }}
                  />
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      borderTop: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "right",
                      fontSize: 10.5,
                      color: "#333",
                    }}
                  >
                    CGST Output-9% ({companyInfo.stateName})
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      borderTop: "1px solid #aaa",
                    }}
                  />
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      borderTop: "1px solid #aaa",
                    }}
                  />
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      borderTop: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "center",
                      fontSize: 10.5,
                    }}
                  >
                    9
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      borderTop: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "center",
                      fontSize: 10.5,
                    }}
                  >
                    %
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      borderTop: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "right",
                      fontSize: 10.5,
                    }}
                  >
                    {formatINR(cgstAmount)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderLeft: "1px solid #aaa",
                      borderRight: "1px solid #aaa",
                      padding: "5px 6px",
                    }}
                  />
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "right",
                      fontSize: 10.5,
                      color: "#333",
                    }}
                  >
                    SGST Output-9% ({companyInfo.stateName})
                  </td>
                  <td style={{ borderRight: "1px solid #aaa" }} />
                  <td style={{ borderRight: "1px solid #aaa" }} />
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "center",
                      fontSize: 10.5,
                    }}
                  >
                    9
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "center",
                      fontSize: 10.5,
                    }}
                  >
                    %
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid #aaa",
                      padding: "5px 6px",
                      textAlign: "right",
                      fontSize: 10.5,
                    }}
                  >
                    {formatINR(sgstAmount)}
                  </td>
                </tr>
              </>
            ) : isNoGst ? null : (
              <tr>
                <td
                  style={{
                    borderLeft: "1px solid #aaa",
                    borderRight: "1px solid #aaa",
                    borderTop: "1px solid #aaa",
                    padding: "5px 6px",
                  }}
                />
                <td
                  style={{
                    borderRight: "1px solid #aaa",
                    borderTop: "1px solid #aaa",
                    padding: "5px 6px",
                    textAlign: "right",
                    fontSize: 10.5,
                    color: "#333",
                  }}
                >
                  IGST Output-{GST_RATE}% ({companyInfo.stateName})
                </td>
                <td
                  style={{
                    borderRight: "1px solid #aaa",
                    borderTop: "1px solid #aaa",
                  }}
                />
                <td
                  style={{
                    borderRight: "1px solid #aaa",
                    borderTop: "1px solid #aaa",
                  }}
                />
                <td
                  style={{
                    borderRight: "1px solid #aaa",
                    borderTop: "1px solid #aaa",
                    padding: "5px 6px",
                    textAlign: "center",
                    fontSize: 10.5,
                  }}
                >
                  {GST_RATE}
                </td>
                <td
                  style={{
                    borderRight: "1px solid #aaa",
                    borderTop: "1px solid #aaa",
                    padding: "5px 6px",
                    textAlign: "center",
                    fontSize: 10.5,
                  }}
                >
                  %
                </td>
                <td
                  style={{
                    borderRight: "1px solid #aaa",
                    borderTop: "1px solid #aaa",
                    padding: "5px 6px",
                    textAlign: "right",
                    fontSize: 10.5,
                  }}
                >
                  {formatINR(igstAmount)}
                </td>
              </tr>
            )}

            {/* Round Off row */}
            <tr>
              <td
                style={{
                  borderLeft: "1px solid #aaa",
                  borderRight: "1px solid #aaa",
                }}
              />
              <td
                style={{
                  borderRight: "1px solid #aaa",
                  padding: "3px 6px",
                  textAlign: "right",
                  fontSize: 10.5,
                  color: "#333",
                }}
              >
                Round Off
              </td>
              <td style={{ borderRight: "1px solid #aaa" }} />
              <td style={{ borderRight: "1px solid #aaa" }} />
              <td style={{ borderRight: "1px solid #aaa" }} />
              <td style={{ borderRight: "1px solid #aaa" }} />
              <td
                style={{
                  borderRight: "1px solid #aaa",
                  padding: "3px 6px",
                  textAlign: "right",
                  fontSize: 10.5,
                }}
              >
                {(roundOff >= 0 ? "+" : "") + formatINR(roundOff)}
              </td>
            </tr>

            {/* Total row */}
            <tr style={{ background: "#F1F5F9" }}>
              <td style={{ border: "1px solid #aaa", padding: 6 }} />
              <td
                style={{
                  border: "1px solid #aaa",
                  padding: 6,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                Total
              </td>
              <td style={{ border: "1px solid #aaa" }} />
              <td
                style={{
                  border: "1px solid #aaa",
                  padding: 6,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {qtyLabel}
              </td>
              <td style={{ border: "1px solid #aaa" }} />
              <td style={{ border: "1px solid #aaa" }} />
              <td
                style={{
                  border: "1px solid #aaa",
                  padding: 6,
                  textAlign: "right",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ₹ {formatINR(roundedTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words — Tally strip */}
        <div
          style={{
            border: "1px solid #aaa",
            borderTop: "none",
            display: "flex",
            justifyContent: "space-between",
            padding: "5px 8px",
            fontSize: 10.5,
            background: "#F1F5F9",
          }}
        >
          <span>
            <strong>Amount Chargeable (in words):</strong> &nbsp; INR{" "}
            {amountInWords(roundedTotal)}
          </span>
          <span style={{ color: "#555", fontStyle: "italic" }}>
            E. &amp; O.E.
          </span>
        </div>

        {/* GST Tax Breakup Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 8,
            fontSize: 10.5,
          }}
        >
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {(isSplitGst
                ? [
                    "HSN/SAC",
                    "Taxable Value (₹)",
                    "CGST Rate",
                    "CGST Amt (₹)",
                    "SGST Rate",
                    "SGST Amt (₹)",
                    "Total Amount (₹)",
                  ]
                : isNoGst
                  ? [
                      "HSN/SAC",
                      "Taxable Value (₹)",
                      "GST Rate",
                      "GST Amount (₹)",
                      "Total Amount (₹)",
                    ]
                  : [
                      "HSN/SAC",
                      "Taxable Value (₹)",
                      "IGST Rate",
                      "IGST Amount (₹)",
                      "Total Amount (₹)",
                    ]
              ).map((h) => (
                <th
                  key={h}
                  style={{
                    border: "1px solid #ccc",
                    padding: "6px 10px",
                    fontSize: 9.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#475569",
                    textAlign: "center",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "6px 10px",
                  textAlign: "center",
                }}
              >
                {hsnCode}
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "6px 10px",
                  textAlign: "center",
                }}
              >
                {formatINR(baseAmount)}
              </td>
              {isSplitGst ? (
                <>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    9%
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    {formatINR(cgstAmount)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    9%
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    {formatINR(sgstAmount)}
                  </td>
                </>
              ) : (
                <>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    {isNoGst ? 0 : GST_RATE}%
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      textAlign: "center",
                    }}
                  >
                    {formatINR(igstAmount)}
                  </td>
                </>
              )}
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "6px 10px",
                  textAlign: "center",
                }}
              >
                <strong>{formatINR(totalAmount)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount Breakup Box */}
        <div style={{ border: "1px solid #ccc", borderTop: "none" }}>
          {[
            {
              label: "Taxable Amount (Before GST)",
              val: `₹ ${formatINR(baseAmount)}`,
              bold: false,
            },
            ...(isSplitGst
              ? [
                  {
                    label: "CGST @ 9%",
                    val: `₹ ${formatINR(cgstAmount)}`,
                    bold: false,
                  },
                  {
                    label: "SGST @ 9%",
                    val: `₹ ${formatINR(sgstAmount)}`,
                    bold: false,
                  },
                ]
              : isNoGst
                ? []
                : [
                    {
                      label: `IGST @ ${GST_RATE}%`,
                      val: `₹ ${formatINR(igstAmount)}`,
                      bold: false,
                    },
                  ]),
          ].map(({ label, val }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 10px",
                fontSize: 11,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span>{label}</span>
              <span>{val}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
              background: "#EBEBEB",
              color: "#000",
            }}
          >
            <span>Total Amount Payable</span>
            <span>₹ {formatINR(roundedTotal)}</span>
          </div>
        </div>

        {/* Bank Details */}
        <div
          style={{
            marginTop: 8,
            border: "1px solid #aaa",
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#64748b",
              letterSpacing: 0.4,
              marginBottom: 6,
            }}
          >
            Company's Bank Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 20px",
              fontSize: 10.5,
            }}
          >
            {[
              ["Account Holder", companyInfo.bankAccountHolder],
              ["Account No.", companyInfo.bankAccountNumber],
              ["Bank Name", companyInfo.bankName],
              ["Branch", companyInfo.bankBranch],
              ["IFSC Code", companyInfo.bankIFSC],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#64748b", fontSize: 10, minWidth: 100 }}>
                  {k}
                </span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>: {v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms heading + Scope (same as Page1termsHTML in pdfGenerator) */}
        <div
          style={{
            marginTop: 10,
            borderBottom: "1px solid #D5D5D5",
            paddingBottom: 4,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: "#1e293b",
          }}
        >
          Terms &amp; Conditions
        </div>
        <div style={{ fontSize: 10, color: "#64748b", margin: "4px 0 8px" }}>
          Invoice No: <strong>{bill.billNumber}</strong> &nbsp;|&nbsp;{" "}
          {companyInfo.companyName} &nbsp;|&nbsp; {companyInfo.website}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            Scope of Services
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li style={{ fontSize: 10.5, color: "#334155", lineHeight: 1.6 }}>
              Release PO.: Received in Ashatha Enterprises, Delivery: Within 2-3
              working days after releasing PO after order Acceptance. GST Paid
              Warranty as per company Payment 100% advance Price will be changed
              as per Market up-down Any other work will be charged extra as per
              the work.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid #e2e8f0",
            fontSize: 9.5,
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          <strong>SUBJECT TO {companyInfo.jurisdiction} JURISDICTION</strong>{" "}
          &nbsp;|&nbsp; This is a System Generated Invoice &nbsp;|&nbsp; Page 1
        </div>
      </div>
    </Modal>
  );
};
