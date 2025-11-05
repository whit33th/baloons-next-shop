import type React from "react";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  Icon?: IconComponent;
  /**
   * Size in px for the icon (will be applied to width/height).
   * Defaults to 18.
   */
  iconSize?: number;
  /**
   * Additional className for the native input element.
   */
  className?: string;
}

/**
 * Минималистичный переиспользуемый инпут.
 * Переключил внешний контейнер на <label> и убрал absolute для иконки:
 * теперь иконка и input находятся в потоке flex с gap — при клике по любой части
 * лейбла будет фокусироваться именно инпут.
 */
export default function Input({
  Icon,
  iconSize = 18,
  className = "",
  ...props
}: InputProps) {
  return (
    <label
      className={`relative flex items-center gap-2.5 rounded-lg border border-[rgba(15,23,42,0.06)] bg-white px-2.5 py-0 transition focus-within:border-slate-300`}
    >
      {Icon ? (
        <Icon
          width={iconSize}
          height={iconSize}
          className="flex-shrink-0 text-slate-700"
          aria-hidden={true}
        />
      ) : null}

      <input
        {...props}
        className={`flex-1 border-none bg-transparent text-sm text-slate-900 outline-none focus:outline-none ${className}`}
      />
    </label>
  );
}
