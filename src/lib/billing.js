export function computeBilling({ parts, labor, job }) {
  const partsTotal = parts.reduce(
    (s, p) => s + (p.quantity || 0) * (p.unit_cost || 0),
    0
  );
  const laborTotal = labor.reduce(
    (s, l) => s + (l.hours || 0) * (l.hourly_rate || 0),
    0
  );

  const partsDiscountType = job?.parts_discount_type || 'fixed';
  const partsDiscountValue = job?.parts_discount_value || 0;
  const laborDiscountType = job?.labor_discount_type || 'fixed';
  const laborDiscountValue = job?.labor_discount_value || 0;

  const partsDiscount =
    partsDiscountType === 'percentage'
      ? (partsTotal * partsDiscountValue) / 100
      : Math.min(partsDiscountValue, partsTotal);

  const laborDiscount =
    laborDiscountType === 'percentage'
      ? (laborTotal * laborDiscountValue) / 100
      : Math.min(laborDiscountValue, laborTotal);

  const serviceCallFee = job?.service_call_fee || 0;

  const discountedParts = Math.max(partsTotal - partsDiscount, 0);
  const discountedLabor = Math.max(laborTotal - laborDiscount, 0);
  const subtotal = discountedParts + discountedLabor + serviceCallFee;
  const taxAmount = (subtotal * (job?.tax_rate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  return {
    partsTotal,
    laborTotal,
    partsDiscount,
    laborDiscount,
    discountedParts,
    discountedLabor,
    serviceCallFee,
    subtotal,
    taxAmount,
    grandTotal,
  };
}

export function sumPayments(payments = []) {
  return payments.reduce((s, p) => s + (p.amount || 0), 0);
}

export function computeJobProfit({ parts, labor, job }) {
  const billing = computeBilling({ parts, labor, job });
  const partsCost = parts.reduce(
    (s, p) => s + (p.quantity || 0) * (p.unit_cost || 0),
    0
  );
  const laborCost = labor.reduce(
    (s, l) => s + (l.hours || 0) * (l.pay_rate || 0),
    0
  );
  const revenue = billing.subtotal;
  const profit = revenue - partsCost - laborCost;
  return {
    ...billing,
    partsCost,
    laborCost,
    revenue,
    profit,
  };
}