import { CollectorPickup, Transaction } from "./collector-types";

export const MOCK_COLLECTOR_ID = "c0000000-0000-0000-0000-000000000001";

export function calculateEarnings(transactions: Transaction[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let thisMonthTotal = 0;
  let lastMonthTotal = 0;
  let thisMonthQuantity = 0;
  let lastMonthQuantity = 0;
  let thisMonthCount = 0;

  const materialRevenue: Record<string, { value: number; quantity: number }> = {};

  transactions.forEach((tx) => {
    const d = new Date(tx.transaction_date);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      thisMonthTotal += tx.actual_value;
      thisMonthQuantity += tx.actual_quantity_kg;
      thisMonthCount++;

      tx.items.forEach((item) => {
        if (!materialRevenue[item.material_category]) {
          materialRevenue[item.material_category] = { value: 0, quantity: 0 };
        }
        materialRevenue[item.material_category].value += item.value;
        materialRevenue[item.material_category].quantity += item.quantity_kg;
      });
    } else if (
      (currentMonth === 0 && d.getFullYear() === currentYear - 1 && d.getMonth() === 11) ||
      (currentMonth > 0 && d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1)
    ) {
      lastMonthTotal += tx.actual_value;
      lastMonthQuantity += tx.actual_quantity_kg;
    }
  });

  const momGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : null;
  const momQuantityGrowth = lastMonthQuantity > 0 ? thisMonthQuantity - lastMonthQuantity : null;
  const avgTxValue = thisMonthCount > 0 ? thisMonthTotal / thisMonthCount : 0;

  const materialsArray = Object.entries(materialRevenue)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.value - a.value);

  return {
    thisMonthTotal,
    thisMonthQuantity,
    thisMonthCount,
    avgTxValue,
    momGrowth,
    momQuantityGrowth,
    materialsArray,
    isFirstMonth: lastMonthTotal === 0,
  };
}
