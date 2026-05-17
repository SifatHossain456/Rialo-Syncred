"use client";
import { useCountUp } from "@/hooks/useCountUp";

interface Props {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export default function CountUp({ value, duration = 1200, suffix = "", prefix = "", decimals = 0, className = "" }: Props) {
  const count = useCountUp(Math.floor(value), duration);
  const display = decimals > 0
    ? value.toFixed(decimals)
    : count.toLocaleString();

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
