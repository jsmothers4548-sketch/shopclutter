import { base44 } from '@/api/base44Client';

// The app's paid tools read and write through the server, which re-checks the
// shop's plan before touching a record. The screens still show the locked
// state; this is what actually enforces it. A refusal arrives as an error
// whose `locked` flag lets a screen show the upgrade prompt instead of a raw
// failure.

async function send(body) {
  try {
    const res = await base44.functions.invoke('planGate', body);
    const data = res?.data || {};
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.error ||
      err?.message ||
      'That action could not be completed.';
    const error = new Error(message);
    // A 403 is the plan refusal, so the screen can show the upgrade prompt.
    error.locked = status === 403;
    throw error;
  }
}

function entityApi(feature, entity) {
  return {
    create: (data) =>
      send({ feature, action: 'write', entity, op: 'create', payload: data }).then(
        (r) => r.record
      ),
    update: (id, data) =>
      send({
        feature,
        action: 'write',
        entity,
        op: 'update',
        payload: { id, data },
      }).then((r) => r.record),
    delete: (id) =>
      send({ feature, action: 'write', entity, op: 'delete', payload: { id } }),
    bulkCreate: (rows) =>
      send({ feature, action: 'write', entity, op: 'bulkCreate', payload: rows }).then(
        (r) => r.records
      ),
    bulkUpdate: (rows) =>
      send({ feature, action: 'write', entity, op: 'bulkUpdate', payload: rows }).then(
        (r) => r.records
      ),
    deleteMany: (query) =>
      send({
        feature,
        action: 'write',
        entity,
        op: 'deleteMany',
        payload: { query },
      }),
  };
}

export const gated = {
  // Solo is a one-person plan, so adding a person goes through the server,
  // which re-checks the shop's plan. Existing staff are untouched.
  staff: entityApi('staff', 'Staff'),
  staffInvites: entityApi('staff', 'StaffInvite'),
  timeClock: entityApi('time_clock', 'TimeClock'),
  staffTasks: entityApi('staff_tasks', 'StaffTask'),
  templates: entityApi('templates', 'JobTemplate'),
  inventory: entityApi('inventory', 'ShopItem'),
  inventoryCategories: entityApi('inventory', 'InventoryCategory'),
  sales: entityApi('sales', 'Sale'),
  saleItems: entityApi('sales', 'SaleItem'),
  salesStock: entityApi('sales', 'ShopItem'),
  supplierStock: entityApi('supplier_orders', 'ShopItem'),
  partPurchases: entityApi('supplier_orders', 'PartPurchase'),
  reimbursements: entityApi('reimbursements', 'JobExpense'),
  branding: entityApi('branding', 'ShopSettings'),
  // Team and up.
  loyaltyMilestones: entityApi('loyalty', 'LoyaltyMilestone'),
  loyaltyReminders: entityApi('loyalty', 'LoyaltyReminder'),
  lateFees: entityApi('late_fees', 'LateFee'),
  lateFeeExpenses: entityApi('late_fees', 'JobExpense'),
};

// Reads for the tools that are views over job data: the same lists the screen
// needs, in one checked call.
export async function gatedRead(feature, reads) {
  const data = await send({ feature, action: 'read', reads });
  return data.results || [];
}