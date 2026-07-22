import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({ checked = false, onChange, label, className = '', disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
        <div
          className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
            checked
              ? 'bg-planner-primary border-planner-primary text-white shadow-sm scale-105'
              : 'border-planner-border bg-planner-card hover:border-planner-primary/60'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>
      {label && <span className={`text-sm ${checked ? 'line-through text-planner-muted' : 'text-planner-text'}`}>{label}</span>}
    </label>
  );
};

export default Checkbox;
