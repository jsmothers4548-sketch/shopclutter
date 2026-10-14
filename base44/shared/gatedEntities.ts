// Which records each paid tool is allowed to touch on the server. A request
// naming anything outside its tool's list is refused, so the gate stays
// narrow: no tool can reach data it does not own.

export const FEATURE_ENTITIES: Record<string, string[]> = {
  templates: ["JobTemplate"],
  inventory: ["ShopItem", "InventoryCategory"],
  sales: ["Sale", "SaleItem", "ShopItem"],
  supplier_orders: ["PartPurchase", "ShopItem"],
  time_clock: ["TimeClock"],
  staff_tasks: ["StaffTask"],
  reimbursements: ["JobExpense"],
  branding: ["ShopSettings"],
  staff: ["Staff", "StaffInvite"],
  reports: [
    "Job",
    "Part",
    "LaborEntry",
    "Sale",
    "SaleItem",
    "JobExpense",
    "Payment",
    "PartPurchase",
    "ShopItem",
    "Staff",
    "JobTimeEntry",
  ],
  employee_earnings: ["LaborEntry", "Job", "Staff", "TimeClock", "JobExpense"],
};

// The shop settings record also holds the rates and tax a free shop needs, so
// the branding tool may only ever write the branding fields on it.
export const BRAND_FIELDS = [
  "brand_name",
  "brand_logo_url",
  "brand_address",
  "brand_phone",
  "brand_email",
];