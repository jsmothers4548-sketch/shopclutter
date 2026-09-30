import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  EQUIPMENT_TYPES,
  OTHER_EQUIPMENT_TYPE,
  splitEquipmentType,
  joinEquipmentType,
} from '@/lib/equipmentTypes';

// The Equipment Type picker: the guided list, plus a field to type in anything
// that is not on it. The chosen name is what the form saves.
export default function EquipmentTypeField({ value, onChange, required }) {
  const [state, setState] = useState(() => splitEquipmentType(value));

  // Follow the value when it changes from outside — voice intake, a unit label
  // lookup, or a template being applied.
  useEffect(() => {
    setState((prev) => {
      const next = splitEquipmentType(value);
      if (
        joinEquipmentType(prev.selected, prev.custom) ===
        joinEquipmentType(next.selected, next.custom)
      ) {
        return prev;
      }
      return next;
    });
  }, [value]);

  const pick = (selected) => {
    const custom = selected === OTHER_EQUIPMENT_TYPE ? state.custom : '';
    setState({ selected, custom });
    onChange?.(joinEquipmentType(selected, custom));
  };

  const typeIn = (custom) => {
    setState((prev) => ({ ...prev, custom }));
    onChange?.(joinEquipmentType(state.selected, custom));
  };

  return (
    <div className="space-y-2">
      <div>
        <Label>Equipment Type{required ? ' *' : ''}</Label>
        <select
          value={state.selected}
          onChange={(e) => pick(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {EQUIPMENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
          <option>{OTHER_EQUIPMENT_TYPE}</option>
        </select>
      </div>
      {state.selected === OTHER_EQUIPMENT_TYPE && (
        <Input
          value={state.custom}
          onChange={(e) => typeIn(e.target.value)}
          placeholder="Type the equipment name"
          autoCapitalize="words"
          required={required}
        />
      )}
    </div>
  );
}