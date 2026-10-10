// Visit milestones and the discounts they earn. The shop sets a milestone per
// number of visits and decides whether the reward is a percentage of the ticket
// or a flat amount off.

export function discountLabel(type, value) {
  const amount = Number(value) || 0;
  if (amount <= 0) return 'No discount';
  return type === 'percentage'
    ? `${amount}% off`
    : `$${amount.toFixed(2)} off`;
}

// What a milestone discount takes off a ticket subtotal.
export function loyaltyAmount(subtotal, type, value) {
  const amount = Number(value) || 0;
  const base = Number(subtotal) || 0;
  if (amount <= 0 || base <= 0) return 0;
  return type === 'percentage'
    ? (base * amount) / 100
    : Math.min(amount, base);
}

export function ordinal(n) {
  const num = Number(n) || 0;
  const rem100 = num % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${num}th`;
  switch (num % 10) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}