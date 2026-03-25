import { authenticate } from "../shopify.server";
import { getLeakFindings } from "../models/LeakFinding.server";
import type { LeakFinding } from "../models/LeakFinding.server";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { useMemo, useState } from "react";

// --------------------------------------------
// LOADER
// --------------------------------------------
// Runs on the server before the page renders.
// Authenticates the Shopify session and loads all leak findings.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const findings: LeakFinding[] = await getLeakFindings(admin);

  return { findings, shop: session.shop };
};

// --------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------

// Formats money values for UI display
function formatCurrency(amount?: number | null) {
  if (amount == null) return "N/A";
  return `$${amount.toFixed(2)}`;
}

// Returns display label for internal rule codes
function getRuleLabel(ruleCode: string) {
  switch (ruleCode) {
    case "DISCOUNT_001":
      return "Discount Leaks";
    case "REFUND_001":
      return "Refund Leaks";
    case "TRAFFIC_001":
      return "Traffic Alerts";
    default:
      return ruleCode;
  }
}

// Returns a friendlier description for each rule code
function getRuleDescription(ruleCode: string) {
  switch (ruleCode) {
    case "DISCOUNT_001":
      return "Orders with unusually high discount percentages.";
    case "REFUND_001":
      return "Orders where refunded amounts may indicate lost revenue.";
    case "TRAFFIC_001":
      return "Store-level signals that may indicate low order activity.";
    default:
      return "Revenue anomaly detected.";
  }
}

// Badge colors based on severity
function getSeverityBadgeStyle(severity: LeakFinding["severity"]) {
  switch (severity) {
    case "high":
      return {
        background: "rgba(239, 68, 68, 0.12)",
        color: "#b91c1c",
        border: "1px solid rgba(239, 68, 68, 0.25)",
      };
    case "medium":
      return {
        background: "rgba(245, 158, 11, 0.12)",
        color: "#b45309",
        border: "1px solid rgba(245, 158, 11, 0.25)",
      };
    case "low":
    default:
      return {
        background: "rgba(59, 130, 246, 0.12)",
        color: "#1d4ed8",
        border: "1px solid rgba(59, 130, 246, 0.25)",
      };
  }
}

// Accent colors used in charts/cards
function getAccentColor(key: string) {
  switch (key) {
    case "DISCOUNT_001":
      return "#7c3aed";
    case "REFUND_001":
      return "#ef4444";
    case "TRAFFIC_001":
      return "#0ea5e9";
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#3b82f6";
    default:
      return "#64748b";
  }
}

// --------------------------------------------
// SMALL REUSABLE UI COMPONENTS
// --------------------------------------------

function MetricCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <p
        style={{
          margin: "0 0 10px 0",
          fontSize: "13px",
          color: "#64748b",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </p>
      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "30px",
          lineHeight: 1.1,
          color: "#0f172a",
        }}
      >
        {value}
      </h2>
      {subtext ? (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#475569",
          }}
        >
          {subtext}
        </p>
      ) : null}
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
        background: active ? "#0f172a" : "#ffffff",
        color: active ? "#ffffff" : "#334155",
        borderRadius: "999px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: active
          ? "0 8px 24px rgba(15, 23, 42, 0.18)"
          : "0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      {label}
    </button>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "22px",
        padding: "22px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div style={{ marginBottom: "18px" }}>
        <h3
          style={{
            margin: "0 0 6px 0",
            fontSize: "18px",
            color: "#0f172a",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

function HorizontalBarChart({
  items,
  formatValue,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  formatValue?: (value: number) => string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {items.map((item) => {
        const widthPercent = (item.value / maxValue) * 100;

        return (
          <div key={item.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                gap: "12px",
              }}
            >
              <span
                style={{
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {formatValue ? formatValue(item.value) : item.value}
              </span>
            </div>

            <div
              style={{
                height: "12px",
                borderRadius: "999px",
                background: "#eef2f7",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${widthPercent}%`,
                  minWidth: item.value > 0 ? "8px" : "0px",
                  height: "100%",
                  borderRadius: "999px",
                  background: item.color,
                  boxShadow: `0 6px 14px ${item.color}33`,
                  transition: "width 0.35s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------
// MAIN PAGE COMPONENT
// --------------------------------------------

export default function RevenueLeaksPage() {
  const { findings, shop } = useLoaderData() as {
    findings: LeakFinding[];
    shop: string;
  };

  // Active filter for finding cards
  const [activeFilter, setActiveFilter] = useState<
    "all" | "discount" | "refund" | "traffic" | "high"
  >("all");

  // --------------------------------------------
  // DERIVED DATA
  // --------------------------------------------

  const discountFindings = useMemo(
    () => findings.filter((finding) => finding.ruleCode === "DISCOUNT_001"),
    [findings],
  );

  const refundFindings = useMemo(
    () => findings.filter((finding) => finding.ruleCode === "REFUND_001"),
    [findings],
  );

  const trafficFindings = useMemo(
    () => findings.filter((finding) => finding.ruleCode === "TRAFFIC_001"),
    [findings],
  );

  const highSeverityCount = useMemo(
    () => findings.filter((finding) => finding.severity === "high").length,
    [findings],
  );

  const mediumSeverityCount = useMemo(
    () => findings.filter((finding) => finding.severity === "medium").length,
    [findings],
  );

  const lowSeverityCount = useMemo(
    () => findings.filter((finding) => finding.severity === "low").length,
    [findings],
  );

  const totalAmountAtRisk = useMemo(() => {
    return findings.reduce((sum, finding) => sum + (finding.amountAtRisk ?? 0), 0);
  }, [findings]);

  // Filter findings shown in the list section
  const filteredFindings = useMemo(() => {
    switch (activeFilter) {
      case "discount":
        return discountFindings;
      case "refund":
        return refundFindings;
      case "traffic":
        return trafficFindings;
      case "high":
        return findings.filter((finding) => finding.severity === "high");
      case "all":
      default:
        return findings;
    }
  }, [
    activeFilter,
    findings,
    discountFindings,
    refundFindings,
    trafficFindings,
  ]);

  // Chart 1: number of findings by rule
  const findingsByRule = [
    {
      label: "Discount Leaks",
      value: discountFindings.length,
      color: getAccentColor("DISCOUNT_001"),
    },
    {
      label: "Refund Leaks",
      value: refundFindings.length,
      color: getAccentColor("REFUND_001"),
    },
    {
      label: "Traffic Alerts",
      value: trafficFindings.length,
      color: getAccentColor("TRAFFIC_001"),
    },
  ];

  // Chart 2: amount at risk by rule
  const amountByRule = [
    {
      label: "Discount Leaks",
      value: discountFindings.reduce(
        (sum, item) => sum + (item.amountAtRisk ?? 0),
        0,
      ),
      color: getAccentColor("DISCOUNT_001"),
    },
    {
      label: "Refund Leaks",
      value: refundFindings.reduce(
        (sum, item) => sum + (item.amountAtRisk ?? 0),
        0,
      ),
      color: getAccentColor("REFUND_001"),
    },
    {
      label: "Traffic Alerts",
      value: trafficFindings.reduce(
        (sum, item) => sum + (item.amountAtRisk ?? 0),
        0,
      ),
      color: getAccentColor("TRAFFIC_001"),
    },
  ];

  // Chart 3: severity breakdown
  const severityBreakdown = [
    {
      label: "High Severity",
      value: highSeverityCount,
      color: getAccentColor("high"),
    },
    {
      label: "Medium Severity",
      value: mediumSeverityCount,
      color: getAccentColor("medium"),
    },
    {
      label: "Low Severity",
      value: lowSeverityCount,
      color: getAccentColor("low"),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #e0e7ff 0%, #f8fafc 35%, #eef2ff 100%)",
        padding: "28px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* --------------------------------------------
            HERO HEADER
        -------------------------------------------- */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "28px",
            padding: "30px",
            marginBottom: "24px",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #312e81 100%)",
            boxShadow: "0 30px 60px rgba(15, 23, 42, 0.22)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-60px",
              top: "-60px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              filter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "80px",
              bottom: "-40px",
              width: "160px",
              height: "160px",
              borderRadius: "999px",
              background: "rgba(129,140,248,0.18)",
              filter: "blur(4px)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.10)",
                color: "#c7d2fe",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              LIVE SHOPIFY ANALYTICS
            </div>

            <h1
              style={{
                margin: "0 0 10px 0",
                fontSize: "40px",
                lineHeight: 1.05,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              Revenue Leak Dashboard
            </h1>

            <p
              style={{
                margin: "0 0 18px 0",
                color: "rgba(255,255,255,0.78)",
                fontSize: "16px",
                maxWidth: "760px",
                lineHeight: 1.7,
              }}
            >
              Detect discount abuse, refund leakage, and low-order activity from
              real Shopify order data. Designed to help merchants spot hidden
              revenue loss before it compounds.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  color: "#ffffff",
                  fontSize: "14px",
                }}
              >
                Shop: <strong>{shop}</strong>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  color: "#ffffff",
                  fontSize: "14px",
                }}
              >
                Findings Monitored: <strong>{findings.length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------
            TOP KPI CARDS
        -------------------------------------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <MetricCard
            label="Total Findings"
            value={findings.length}
            subtext="Combined order-level and store-level alerts."
          />

          <MetricCard
            label="Total Amount at Risk"
            value={formatCurrency(totalAmountAtRisk)}
            subtext="Estimated exposed revenue from current leak findings."
          />

          <MetricCard
            label="Discount Leaks"
            value={discountFindings.length}
            subtext="Orders with unusually high discount percentages."
          />

          <MetricCard
            label="Refund Leaks"
            value={refundFindings.length}
            subtext="Orders with refunded revenue detected."
          />

          <MetricCard
            label="High Severity"
            value={highSeverityCount}
            subtext="Issues that deserve immediate merchant attention."
          />
        </div>

        {/* --------------------------------------------
            FILTER BAR
        -------------------------------------------- */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "22px",
          }}
        >
          <FilterPill
            active={activeFilter === "all"}
            label={`All (${findings.length})`}
            onClick={() => setActiveFilter("all")}
          />
          <FilterPill
            active={activeFilter === "discount"}
            label={`Discounts (${discountFindings.length})`}
            onClick={() => setActiveFilter("discount")}
          />
          <FilterPill
            active={activeFilter === "refund"}
            label={`Refunds (${refundFindings.length})`}
            onClick={() => setActiveFilter("refund")}
          />
          <FilterPill
            active={activeFilter === "traffic"}
            label={`Traffic (${trafficFindings.length})`}
            onClick={() => setActiveFilter("traffic")}
          />
          <FilterPill
            active={activeFilter === "high"}
            label={`High Severity (${highSeverityCount})`}
            onClick={() => setActiveFilter("high")}
          />
        </div>

        {/* --------------------------------------------
            CHARTS SECTION
        -------------------------------------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          <ChartCard
            title="Findings by Rule"
            subtitle="See which rule type is generating the most alerts."
          >
            <HorizontalBarChart items={findingsByRule} />
          </ChartCard>

          <ChartCard
            title="Amount at Risk by Rule"
            subtitle="Compare the revenue impact of each leak category."
          >
            <HorizontalBarChart
              items={amountByRule}
              formatValue={(value) => formatCurrency(value)}
            />
          </ChartCard>

          <ChartCard
            title="Severity Breakdown"
            subtitle="Quick view of urgency across all detected findings."
          >
            <HorizontalBarChart items={severityBreakdown} />
          </ChartCard>
        </div>

        {/* --------------------------------------------
            RULE SUMMARY STRIP
        -------------------------------------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {["DISCOUNT_001", "REFUND_001", "TRAFFIC_001"].map((ruleCode) => {
            const count = findings.filter(
              (finding) => finding.ruleCode === ruleCode,
            ).length;

            return (
              <div
                key={ruleCode}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "20px",
                  padding: "18px",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "999px",
                    background: getAccentColor(ruleCode),
                    marginBottom: "12px",
                    boxShadow: `0 0 0 6px ${getAccentColor(ruleCode)}22`,
                  }}
                />
                <h3
                  style={{
                    margin: "0 0 6px 0",
                    color: "#0f172a",
                    fontSize: "18px",
                  }}
                >
                  {getRuleLabel(ruleCode)}
                </h3>
                <p
                  style={{
                    margin: "0 0 14px 0",
                    color: "#64748b",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  {getRuleDescription(ruleCode)}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#0f172a",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  {count} active finding{count === 1 ? "" : "s"}
                </div>
              </div>
            );
          })}
        </div>

        {/* --------------------------------------------
            FINDINGS LIST
        -------------------------------------------- */}
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: "26px",
            padding: "24px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "flex-start",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "24px",
                  color: "#0f172a",
                }}
              >
                Live Findings Feed
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Showing {filteredFindings.length} finding
                {filteredFindings.length === 1 ? "" : "s"} for the selected
                view.
              </p>
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div
              style={{
                padding: "26px",
                borderRadius: "18px",
                border: "1px dashed #cbd5e1",
                background: "#f8fafc",
                color: "#475569",
                textAlign: "center",
                fontSize: "15px",
              }}
            >
              No findings match this filter.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "22px",
                    padding: "20px",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#334155",
                          fontSize: "12px",
                          fontWeight: 700,
                          marginBottom: "10px",
                        }}
                      >
                        {getRuleLabel(finding.ruleCode)}
                      </div>

                      <h3
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "20px",
                          color: "#0f172a",
                          lineHeight: 1.3,
                        }}
                      >
                        {finding.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        Rule Code: <strong>{finding.ruleCode}</strong>
                      </p>
                    </div>

                    <span
                      style={{
                        ...getSeverityBadgeStyle(finding.severity),
                        padding: "8px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 800,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "14px",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "14px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          color: "#64748b",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          fontWeight: 700,
                        }}
                      >
                        Status
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {finding.status}
                      </p>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "14px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          color: "#64748b",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          fontWeight: 700,
                        }}
                      >
                        Amount at Risk
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontWeight: 700,
                        }}
                      >
                        {formatCurrency(finding.amountAtRisk)}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#334155",
                        lineHeight: 1.75,
                        fontSize: "14px",
                      }}
                    >
                      {finding.description ?? "No description available."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}