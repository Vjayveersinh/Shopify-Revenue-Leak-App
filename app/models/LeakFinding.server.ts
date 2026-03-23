export type LeakFinding = {
  id: string;
  title: string;
  ruleCode: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
  amountAtRisk?: number | null;
  description?: string | null;
};

type Money = {
  amount: string;
  currencyCode: string;
};

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
};

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

export async function getLeakFindings(admin: any): Promise<LeakFinding[]> {
  const findings: LeakFinding[] = [];

  try {
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
            }
          }
        }
      }
    `);

    const result = (await response.json()) as ShopifyOrdersResponse;

    if (result.errors && result.errors.length > 0) {
      console.error("Shopify GraphQL errors:", result.errors);
      return findings;
    }

    const orders = result.data?.orders?.edges?.map((edge) => edge.node) ?? [];

    for (const order of orders) {
      const discountAmount = Number(
        order.currentTotalDiscountsSet?.shopMoney?.amount ?? "0",
      );

      const discountedSubtotal = Number(
        order.subtotalPriceSet?.shopMoney?.amount ?? "0",
      );

      if (discountedSubtotal <= 0 || discountAmount <= 0) {
        continue;
      }

      const originalSubtotal = discountedSubtotal + discountAmount;
      const discountPercent = (discountAmount / originalSubtotal) * 100;
      const currencyCode =
        order.subtotalPriceSet?.shopMoney?.currencyCode ?? "USD";

      let severity: LeakFinding["severity"] | null = null;

      if (discountPercent >= 50) {
        severity = "high";
      } else if (discountPercent >= 30) {
        severity = "medium";
      }

      if (!severity) {
        continue;
      }

      findings.push({
        id: order.id,
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
  } catch (error) {
    console.error("Error fetching leak findings:", error);
  }

  return findings;
}