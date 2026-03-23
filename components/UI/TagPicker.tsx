"use client";

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  id?: string;
};

export function TagPicker({
  label,
  value,
  options,
  onChange,
  disabled,
  id,
}: Props) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <select
        id={id}
        className="rounded-lg border border-white/10 bg-navy-deep/80 px-3 py-2.5 text-foreground outline-none transition focus:border-indigo-brand/60 focus:ring-2 focus:ring-indigo-brand/30 disabled:opacity-50"
        value={value}
        disabled={disabled || options.length === 0}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.length === 0 ? (
          <option value="">Load tags first</option>
        ) : (
          options.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
