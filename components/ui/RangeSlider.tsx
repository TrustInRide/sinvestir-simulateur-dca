"use client";

import { forwardRef, useId } from "react";
import type { CSSProperties, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface RangeSliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue"
  > {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** Formats the value shown next to the label (e.g. `(v) => `${v} €``). */
  formatValue?: (value: number) => string;
  containerClassName?: string;
}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  function RangeSlider(
    {
      label,
      value,
      min = 0,
      max = 100,
      step = 1,
      formatValue,
      id,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const sliderId = id ?? generatedId;
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    const clampedPercent = Math.min(100, Math.max(0, percent));

    return (
      <div className={cn("flex flex-col gap-2.5", containerClassName)}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={sliderId}
              className="text-sm font-medium text-foreground/90"
            >
              {label}
            </label>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {formatValue ? formatValue(value) : value}
            </span>
          </div>
        )}
        <input
          ref={ref}
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={formatValue ? formatValue(value) : undefined}
          className={cn("range-slider", className)}
          style={{ "--range-percent": `${clampedPercent}%` } as CSSProperties}
          {...props}
        />
      </div>
    );
  },
);
