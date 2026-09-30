// The machines the shop services. One shared list keeps intake, job templates
// and unit records in step — add a machine here and every picker offers it.
export const EQUIPMENT_TYPES = [
  'Lawn Mower',
  'Riding Mower',
  'Zero-Turn Mower',
  'Weed Eater',
  'Edger',
  'Hedge Trimmer',
  'Handheld Blower',
  'Backpack Blower',
  'Chainsaw',
  'Pressure Washer',
  'Generator',
  'Compressor',
  'Tiller',
  'Snow Blower',
  'Motorcycle/ATV',
  'Go-Kart',
  'Side-by-Side (UTV)',
];

// The last choice in the picker: opens a field to type the machine's own name.
export const OTHER_EQUIPMENT_TYPE = 'Other (type it in)';

// A stored name maps back onto the picker. Anything that is not on the list —
// an older "Other", or a name typed in earlier — reopens as the typed-in state
// so the value is never lost or rewritten.
export function splitEquipmentType(value) {
  const name = (value || '').trim();
  if (!name) return { selected: EQUIPMENT_TYPES[0], custom: '' };
  if (EQUIPMENT_TYPES.includes(name)) return { selected: name, custom: '' };
  return { selected: OTHER_EQUIPMENT_TYPE, custom: name };
}

// What actually gets stored: a list choice as-is, or the typed-in name
// (falling back to "Other" when nothing was typed).
export function joinEquipmentType(selected, custom) {
  if (selected !== OTHER_EQUIPMENT_TYPE) return selected;
  return (custom || '').trim() || 'Other';
}