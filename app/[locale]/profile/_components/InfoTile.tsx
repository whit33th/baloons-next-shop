import { palette } from "./palette";

type InfoTileProps = {
  label: string;
  value: string;
  fullWidth?: boolean;
};

export function InfoTile({ label, value, fullWidth }: InfoTileProps) {
  return (
    <div
      className={`rounded-3xl border px-5 py-4 ${palette.softBorder} ${palette.softSurface} ${
        fullWidth ? "md:col-span-2" : ""
      }`}
    >
      <p
        className={`text-xs tracking-[0.3rem] uppercase ${palette.subtleText}`}
      >
        {label}
      </p>
      <p className="text-deep mt-2 text-lg font-medium whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}
