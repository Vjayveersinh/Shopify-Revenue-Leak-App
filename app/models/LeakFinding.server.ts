// --------------------------------------------
// TYPE DEFINITIONS
// --------------------------------------------

// This represents a single "leak" detected by the system
export type LeakFinding = {
  id: string; // unique identifier for each finding
  title: string; // short title shown in the dashboard
  ruleCode: string; // internal rule identifier
  severity: "low" | "medium" | "high"; // business impact level
  status: "open" | "resolved"; // current status of the finding
  amountAtRisk?: number | null; // optional monetary impact
  description?: string | null; // detailed explanation for the user
};

// Shopify money object shape
type Money = {
  amount: string; // Shopify returns money amounts as strings
  currencyCode: string; // e.g. USD, CAD
};

// Minimal order fields needed for our leak rules
type ShopifyOrderNode = {
  id: string;
  name: string;
  createdAt: string;
  currentTotalDiscountsSet?: {
    shopMoney?: Money;
  };
  subtotalPriceSet?: {
    shopMoney?: Money;
  };
  totalRefundedSet?: {
    shopMoney?: Money;
  };
};

// Expected Shopify GraphQL response shape
type ShopifyOrdersResponse = {
  data?: {
    orders?: {
      edges?: Array<{
        node: ShopifyOrderNode;
      }>;
    };
  };
  errors?: Array<{
    message: string;
  }>;
};

// --------------------------------------------
// MAIN FUNCTION
// --------------------------------------------

// Fetch recent Shopify orders and detect possible revenue leaks
export async function getLeakFindings(admin: any): Promise<LeakFinding[]> {
  const findings: LeakFinding[] = [];

  try {
    // --------------------------------------------
    // STEP 1: Fetch the 25 most recent orders
    // --------------------------------------------
    const response = await admin.graphql(`
      query GetRecentOrders {
        orders(first: 25, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              currentTotalDiscountsSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalRefundedSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `);

    const result = (await response.json()) as ShopifyOrdersResponse;

    // --------------------------------------------
    // STEP 2: Stop early if Shopify returned errors
    // --------------------------------------------
    if (result.errors && result.errors.length > 0) {
      console.error("Shopify GraphQL errors:", result.errors);
      return findings;
    }

    // Flatten GraphQL edges into a simple orders array
    const orders = result.data?.orders?.edges?.map((edge) => edge.node) ?? [];

    // --------------------------------------------
    // STEP 3: Run order-level rules
    // --------------------------------------------
    for (const order of orders) {
      // Choose currency from available fields, fallback to USD
      const currencyCode =
        order.subtotalPriceSet?.shopMoney?.currencyCode ??
        order.totalRefundedSet?.shopMoney?.currencyCode ??
        "USD";

      // ============================================
      // RULE 1: HIGH DISCOUNT DETECTION
      // ============================================
      // Detect orders where discount percentage is high enough
      // to be considered a possible revenue leak.

      const discountAmount = Number(
        order.currentTotalDiscountsSet?.shopMoney?.amount ?? "0",
      );

      const discountedSubtotal = Number(
        order.subtotalPriceSet?.shopMoney?.amount ?? "0",
      );

      // We only calculate discount percent when both values are valid
      if (discountedSubtotal > 0 && discountAmount > 0) {
        // Original subtotal before discount
        const originalSubtotal = discountedSubtotal + discountAmount;

        // Discount percentage based on original subtotal
        const discountPercent = (discountAmount / originalSubtotal) * 100;

        let severity: LeakFinding["severity"] | null = null;

        // Current thresholds:
        // 50%+  => high
        // 30%+  => medium
        if (discountPercent >= 50) {
          severity = "high";
        } else if (discountPercent >= 30) {
          severity = "medium";
        }

        if (severity) {
          findings.push({
            id: `${order.id}-discount`,
            title: `High discount percentage on order ${order.name}`,
            ruleCode: "DISCOUNT_001",
            severity,
            status: "open",
            amountAtRisk: discountAmount,
            description: `Order ${order.name} has a discount of ${discountPercent.toFixed(
              1,
            )}% (${currencyCode} ${discountAmount.toFixed(
              2,
            )}) on an original subtotal of ${currencyCode} ${originalSubtotal.toFixed(
              2,
            )}.`,
          });
        }
      }

      // ============================================
      // RULE 2: REFUND DETECTION
      // ============================================
      // Detect orders with refunded money because refunds can
      // directly reduce store revenue.

      const refundedAmount = Number(
        order.totalRefundedSet?.shopMoney?.amount ?? "0",
      );

      if (refundedAmount > 0) {
        let severity: LeakFinding["severity"] = "low";

        // Current thresholds:
        // 100+ => high
        // 50+  => medium
        // below 50 => low
        if (refundedAmount >= 100) {
          severity = "high";
        } else if (refundedAmount >= 50) {
          severity = "medium";
        }

        findings.push({
          id: `${order.id}-refund`,
          title: `Refund detected on order ${order.name}`,
          ruleCode: "REFUND_001",
          severity,
          status: "open",
          amountAtRisk: refundedAmount,
          description: `Order ${order.name} has refunded ${currencyCode} ${refundedAmount.toFixed(
            2,
          )}, which may indicate a revenue leak from returns, service issues, or manual adjustments.`,
        });
      }
    }

    // --------------------------------------------
    // STEP 4: Run store-level rules
    // --------------------------------------------

    // ============================================
    // RULE 3: LOW RECENT ORDER VOLUME
    // ============================================
    // This is a simple store-level health check.
    // If we only see a very small number of recent orders,
    // it may indicate low traffic, weak conversion, or a store issue.
    //
    // Current MVP logic:
    // - if there are some orders
    // - but fewer than 5 in the recent dataset
    // then create an alert.

    if (orders.length > 0 && orders.length < 5) {
      findings.push({
        id: "LOW_ORDERS_ALERT",
        title: "Low recent order volume detected",
        ruleCode: "TRAFFIC_001",
        severity: "medium",
        status: "open",
        amountAtRisk: null,
        description: `Only ${orders.length} recent order(s) were found. This may indicate low traffic, weak conversion, or another store-level revenue leak.`,
      });
    }
  } catch (error) {
    // --------------------------------------------
    // STEP 5: Catch unexpected runtime errors
    // --------------------------------------------
    console.error("Error fetching leak findings:", error);
  }

  // Return all findings collected from all rules
  return findings;
}