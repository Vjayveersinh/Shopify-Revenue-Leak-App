import { authenticate } from "../shopify.server";
import { getLeakFindings } from "../models/LeakFinding.server";
import type { LeakFinding } from "../models/LeakFinding.server";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  const findings: LeakFinding[] = await getLeakFindings(admin);

  return { findings, shop: session.shop };
};

export default function RevenueLeaksPage() {
  const { findings, shop } = useLoaderData() as {
    findings: LeakFinding[];
    shop: string;
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Revenue Leak Dashboard</h1>
      <p>Shop: {shop}</p>
      <p>Total findings: {findings.length}</p>

      {findings.length === 0 ? (
        <p>No revenue leak findings yet.</p>
      ) : (
        <div style={{ marginTop: "24px" }}>
          {findings.map((finding) => (
            <div
              key={finding.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <h3>{finding.title}</h3>
              <p><strong>Rule:</strong> {finding.ruleCode}</p>
              <p><strong>Severity:</strong> {finding.severity}</p>
              <p><strong>Status:</strong> {finding.status}</p>
              <p><strong>Amount at risk:</strong> {finding.amountAtRisk ?? "N/A"}</p>
              <p>{finding.description ?? "No description"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}