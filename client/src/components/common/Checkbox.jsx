import React, { memo } from 'react';
import { Check } from 'lucide-react';

const Checkbox = memo(({ checked = false, onChange, label, className = '', disabled = false, id }) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none min-h-[36px] py-1 ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="peer sr-only"
          disabled={disabled}
        />
        <div
          className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-planner-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-planner-bg ${
            checked
              ? 'bg-planner-primary border-planner-primary text-white shadow-sm scale-105 active:scale-95'
              : 'border-planner-border bg-planner-card hover:border-planner-primary/60 active:scale-95'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-50 duration-150" />}
        </div>
      </div>
      {label && (
        <span className={`text-sm font-medium transition-colors duration-150 ${checked ? 'line-through text-planner-muted/70' : 'text-planner-text'}`}>
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
