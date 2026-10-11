import { toCsv } from './csv';

// The things a shop can bring in from a spreadsheet. Each field lists the
// column names we try to match automatically, so most files map themselves.

export const CATEGORIES = [
  {
    key: 'customers',
    label: 'Customers',
    description: 'Names, phone numbers and contact details.',
    fields: [
      { key: 'name', label: 'Customer name', required: true, aliases: ['customer', 'customer name', 'name', 'client', 'full name', 'account'], example: 'Dale Peterson' },
      { key: 'phone', label: 'Phone', required: true, aliases: ['phone', 'phone number', 'mobile', 'cell', 'telephone', 'home phone'], example: '555-0142' },
      { key: 'email', label: 'Email', aliases: ['email', 'e-mail', 'email address'], example: 'dale@example.com' },
      { key: 'address', label: 'Address', aliases: ['address', 'street', 'mailing address', 'street address'], example: '18 Mill Rd, Springfield' },
      { key: 'notes', label: 'Notes', aliases: ['notes', 'note', 'comments', 'instructions'], example: 'Prefers a text before pickup' },
    ],
  },
  {
    key: 'equipment',
    label: 'Equipment & units',
    description: 'Units on record, with the label number on each one.',
    dependsOn: ['customers'],
    fields: [
      { key: 'label_number', label: 'Label number', required: true, aliases: ['label', 'label number', 'unit', 'unit number', 'tag', 'tag number', 'unit #'], example: '1042' },
      { key: 'customer_name', label: 'Customer name', aliases: ['customer', 'customer name', 'owner', 'client'], example: 'Dale Peterson' },
      { key: 'equipment_type', label: 'Equipment type', aliases: ['type', 'equipment type', 'equipment', 'category'], example: 'Lawn mower' },
      { key: 'make', label: 'Make', aliases: ['make', 'brand', 'manufacturer'], example: 'Honda' },
      { key: 'model', label: 'Model', aliases: ['model'], example: 'HRN216' },
      { key: 'serial_number', label: 'Serial number', aliases: ['serial', 'serial number', 'serial #', 'sn'], example: 'MABC1234567' },
      { key: 'notes', label: 'Notes', aliases: ['notes', 'note', 'comments'], example: '' },
    ],
  },
  {
    key: 'jobs',
    label: 'Jobs & history',
    description: 'Past and open repair tickets, linked to their customer.',
    dependsOn: ['customers'],
    fields: [
      { key: 'ticket_number', label: 'Ticket number', aliases: ['ticket', 'ticket number', 'ticket #', 'job number', 'job #', 'work order', 'ro number'], example: '1042' },
      { key: 'customer_name', label: 'Customer name', required: true, aliases: ['customer', 'customer name', 'client', 'owner'], example: 'Dale Peterson' },
      { key: 'equipment_type', label: 'Equipment type', required: true, aliases: ['type', 'equipment type', 'equipment'], example: 'Lawn mower' },
      { key: 'make', label: 'Make', aliases: ['make', 'brand', 'manufacturer'], example: 'Honda' },
      { key: 'model', label: 'Model', aliases: ['model'], example: 'HRN216' },
      { key: 'serial_number', label: 'Serial number', aliases: ['serial', 'serial number', 'serial #'], example: '' },
      { key: 'problem_description', label: 'Problem / work done', required: true, aliases: ['problem', 'description', 'issue', 'complaint', 'work performed', 'repair'], example: 'Wont start, needs the carburetor cleaned' },
      { key: 'status', label: 'Status', aliases: ['status', 'stage', 'job status'], example: 'Closed' },
      { key: 'job_location', label: 'Location', aliases: ['location', 'job location', 'site'], example: 'Off-site' },
      { key: 'service_call_fee', label: 'Service call fee', type: 'number', aliases: ['service call', 'service call fee', 'call fee'], example: '80' },
      { key: 'default_labor_rate', label: 'Labor rate', type: 'number', aliases: ['labor rate', 'rate', 'hourly rate'], example: '75' },
      { key: 'tax_rate', label: 'Tax rate', type: 'number', aliases: ['tax', 'tax rate', 'tax %'], example: '7' },
    ],
  },
  {
    key: 'inventory',
    label: 'Parts & inventory',
    description: 'What is on your shelves, with costs and stock levels.',
    fields: [
      { key: 'name', label: 'Part name', required: true, aliases: ['name', 'part', 'part name', 'description', 'item'], example: 'Air filter' },
      { key: 'part_number', label: 'Part number', aliases: ['part number', 'part #', 'sku', 'number', 'mpn'], example: 'AF-2210' },
      { key: 'category', label: 'Category', aliases: ['category', 'type', 'group'], example: 'Filters' },
      { key: 'supplier', label: 'Supplier', aliases: ['supplier', 'vendor', 'manufacturer'], example: 'Kohler' },
      { key: 'stock_quantity', label: 'Quantity on hand', type: 'number', aliases: ['quantity', 'qty', 'stock', 'on hand', 'stock quantity'], example: '12' },
      { key: 'unit_cost', label: 'Unit cost', type: 'number', aliases: ['cost', 'unit cost', 'purchase price'], example: '6.50' },
      { key: 'reorder_threshold', label: 'Reorder at', type: 'number', aliases: ['reorder', 'reorder point', 'reorder at', 'minimum'], example: '3' },
      { key: 'sale_price', label: 'Sale price', type: 'number', aliases: ['price', 'sale price', 'retail', 'sell price'], example: '11.99' },
      { key: 'for_sale', label: 'For sale', type: 'boolean', aliases: ['for sale', 'sellable', 'retail item'], example: 'yes' },
    ],
  },
  {
    key: 'sales',
    label: 'Sales',
    description: 'Counter sales and over-the-counter parts you sold.',
    fields: [
      { key: 'item_description', label: 'Item sold', required: true, aliases: ['item', 'item sold', 'description', 'product'], example: 'Blade 21 inch' },
      { key: 'total_price', label: 'Total price', required: true, type: 'number', aliases: ['total', 'total price', 'amount', 'price'], example: '34.99' },
      { key: 'customer_name', label: 'Customer name', aliases: ['customer', 'customer name', 'client'], example: '' },
      { key: 'part_number', label: 'Part number', aliases: ['part number', 'part #', 'sku'], example: 'BL-2100' },
      { key: 'subtotal', label: 'Subtotal', type: 'number', aliases: ['subtotal', 'sub total'], example: '32.40' },
      { key: 'tax_rate', label: 'Tax rate', type: 'number', aliases: ['tax', 'tax rate', 'tax %'], example: '7' },
      { key: 'unit_cost', label: 'Cost', type: 'number', aliases: ['cost', 'unit cost'], example: '18.00' },
      { key: 'amount_paid', label: 'Amount paid', type: 'number', aliases: ['paid', 'amount paid', 'payment'], example: '34.99' },
      { key: 'sale_date', label: 'Sale date', type: 'date', aliases: ['date', 'sale date', 'sold on'], example: '2026-05-14' },
      { key: 'status', label: 'Status', aliases: ['status', 'paid status'], example: 'Paid' },
      { key: 'notes', label: 'Notes', aliases: ['notes', 'note', 'comments'], example: '' },
    ],
  },
];

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key) || null;
}

const normalizeHeader = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Guess which column feeds each field, leaving anything uncertain for the user.
export function autoMap(headers, fields) {
  const mapping = {};
  const used = new Set();
  fields.forEach((field) => {
    const wanted = [field.key, field.label, ...(field.aliases || [])].map(normalizeHeader);
    let hit = headers.find((h) => !used.has(h) && wanted.includes(normalizeHeader(h)));
    if (!hit) {
      const target = normalizeHeader(field.key);
      hit = headers.find((h) => {
        const key = normalizeHeader(h);
        if (used.has(h) || key.length < 4) return false;
        return key.includes(target) || target.includes(key);
      });
    }
    if (hit) {
      mapping[field.key] = hit;
      used.add(hit);
    }
  });
  return mapping;
}

// Check every row before anything is written, so mistakes surface first.
export function validateRows(category, rows, mapping) {
  return (rows || []).map((raw, index) => {
    const data = {};
    const issues = [];
    category.fields.forEach((field) => {
      const header = mapping[field.key];
      const value = header ? String(raw[header] ?? '').trim() : '';
      if (!value) {
        if (field.required) issues.push(`${field.label} is required`);
        return;
      }
      if (field.type === 'number') {
        const n = Number(value.replace(/[$,]/g, ''));
        if (!Number.isFinite(n)) {
          issues.push(`${field.label} is not a number`);
          return;
        }
        data[field.key] = n;
      } else if (field.type === 'boolean') {
        const t = value.toLowerCase();
        data[field.key] = ['true', 'yes', 'y', '1'].includes(t);
      } else {
        data[field.key] = value;
      }
    });
    return { index, data, issues };
  });
}

export function templateCsv(category) {
  const headers = category.fields.map((f) => f.label);
  const sample = {};
  category.fields.forEach((f) => {
    sample[f.label] = f.example || '';
  });
  return toCsv(headers, [sample]);
}

export function rowSummary(category, data) {
  const parts = [];
  category.fields.forEach((f) => {
    const value = data?.[f.key];
    if (value === undefined || value === '' || value === null) return;
    parts.push(String(value));
  });
  return parts.slice(0, 3).join(' · ');
}