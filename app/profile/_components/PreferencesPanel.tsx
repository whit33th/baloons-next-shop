import { palette } from "./palette";

const preferenceItems = [
  { label: "Order confirmations", defaultChecked: true },
  { label: "Shipping updates", defaultChecked: true },
  { label: "Promotions & inspiration", defaultChecked: false },
  { label: "Restock alerts", defaultChecked: false },
];

export function PreferencesPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {preferenceItems.map((item) => (
        <label
          key={item.label}
          className={`flex items-center justify-between gap-3 rounded-3xl border px-5 py-4 text-sm ${palette.softBorder} ${palette.softSurface} ${palette.mutedText}`}
        >
          <span>{item.label}</span>
          <input
            type="checkbox"
            defaultChecked={item.defaultChecked}
            className="accent-accent h-5 w-5"
          />
        </label>
      ))}
    </div>
  );
}
