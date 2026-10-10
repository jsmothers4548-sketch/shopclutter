export function computeBilling({ parts, labor, job, expenses = [] }) {
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

  const pickupDeliveryType = job?.pickup_delivery_type || 'None';
  const pickupFee = pickupDeliveryType === 'None' ? 0 : job?.pickup_fee || 0;
  const returnFee = pickupDeliveryType === 'None' ? 0 : job?.return_fee || 0;

  const expensesCost = (expenses || []).reduce(
    (s, e) => s + (e.amount || 0),
    0
  );
  const expensesTotal = (expenses || [])
    .filter((e) => e.billable)
    .reduce(
      (s, e) => s + (e.amount || 0) * (1 + (e.markup_percent || 0) / 100),
      0
    );

  const discountedParts = Math.max(partsTotal - partsDiscount, 0);
  const discountedLabor = Math.max(laborTotal - laborDiscount, 0);

  // A visit-milestone reward comes off the whole ticket, before tax.
  const loyaltyDiscountType = job?.loyalty_discount_type || 'fixed';
  const loyaltyDiscountValue = Number(job?.loyalty_discount_value) || 0;
  const beforeLoyalty =
    discountedParts +
    discountedLabor +
    serviceCallFee +
    pickupFee +
    returnFee +
    expensesTotal;
  const loyaltyDiscount =
    loyaltyDiscountValue > 0
      ? loyaltyDiscountType === 'percentage'
        ? (beforeLoyalty * loyaltyDiscountValue) / 100
        : Math.min(loyaltyDiscountValue, beforeLoyalty)
      : 0;
  const subtotal = Math.max(beforeLoyalty - loyaltyDiscount, 0);
  const taxAmount = (subtotal * (job?.tax_rate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  return {
    partsTotal,
    laborTotal,
    partsDiscount,
    laborDiscount,
    discountedParts,
    discountedLabor,
    loyaltyDiscount,
    loyaltyDiscountType,
    loyaltyDiscountValue,
    serviceCallFee,
    pickupDeliveryType,
    pickupFee,
    returnFee,
    subtotal,
    taxAmount,
    grandTotal,
    expensesTotal,
    expensesCost,
  };
}

export function sumPayments(payments = []) {
  return payments.reduce((s, p) => s + (p.amount || 0), 0);
}

export function computeJobProfit({ parts, labor, job, expenses = [] }) {
  const billing = computeBilling({ parts, labor, job, expenses });
  const partsCost = parts.reduce(
    (s, p) => s + (p.quantity || 0) * (p.unit_cost || 0),
    0
  );
  const laborCost = labor.reduce(
    (s, l) => s + (l.hours || 0) * (l.pay_rate || 0),
    0
  );
  const revenue = billing.subtotal;
  const expensesCost = billing.expensesCost;
  const profit = revenue - partsCost - laborCost - expensesCost;
  return {
    ...billing,
    partsCost,
    laborCost,
    revenue,
    profit,
  };
}