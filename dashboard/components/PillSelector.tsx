"use client";

import clsx from "clsx";

interface PillSelectorProps {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}

export function PillSelector({ options, selected, onChange }: PillSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            "pill",
            selected === option.value ? "pill-active" : "pill-default"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
