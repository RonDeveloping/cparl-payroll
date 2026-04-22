"use client";
import React from "react";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number; // ms delay before showing
  placement?: "top" | "bottom"; // support top/bottom
  align?: "center" | "start"; // horizontal alignment of tooltip bubble
  bottomAnchor?: boolean; // anchor tooltip bottom to the trigger bottom instead of above it
};

export default function Tooltip({
  children,
  content,
  delay = 300,
  placement = "top",
  align = "center",
  bottomAnchor = false,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const fadeTimerRef = React.useRef<number | null>(null);

  const onEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMounted(true);
      // wait for mount then show with fade
      fadeTimerRef.current = window.setTimeout(() => setVisible(true), 10);
    }, delay);
  };

  const onLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setVisible(false);
    // unmount after fade out (200ms)
    window.setTimeout(() => setMounted(false), 200);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const alignClasses =
    align === "start" ? "left-0" : "left-1/2 -translate-x-1/2";

  const tooltipClasses =
    `absolute ${alignClasses} z-50 w-max max-w-xs rounded px-3 py-1.5 text-xs shadow-lg transition-opacity duration-200` +
    (visible ? " opacity-100" : " opacity-0") +
    " bg-blue-50/62 text-sky-900 dark:bg-blue-900/62 dark:text-white normal-case tracking-normal font-normal";

  const positionClasses =
    placement === "bottom"
      ? "top-full mt-2"
      : bottomAnchor
        ? "bottom-0"
        : "bottom-full mb-2";

  return (
    <span
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}

      {mounted && (
        <span role="status" className={`${tooltipClasses} ${positionClasses}`}>
          {content}
        </span>
      )}
    </span>
  );
}
