"use client";
// components/tool-tip.tsx
import React from "react";
import { createPortal } from "react-dom";

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
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties>({
    left: -9999,
    top: -9999,
  });
  const timerRef = React.useRef<number | null>(null);
  const fadeTimerRef = React.useRef<number | null>(null);
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLSpanElement | null>(null);

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

  React.useLayoutEffect(() => {
    if (!mounted) return;

    const updateTooltipPosition = () => {
      const wrapper = wrapperRef.current;
      const tooltip = tooltipRef.current;
      if (!wrapper || !tooltip) return;

      const viewportPadding = 8;
      const tooltipGap = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const triggerRect = wrapper.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      let left =
        align === "start"
          ? triggerRect.left
          : triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      left = Math.max(
        viewportPadding,
        Math.min(left, viewportWidth - viewportPadding - tooltipRect.width),
      );

      const preferredTop =
        placement === "bottom"
          ? triggerRect.bottom + tooltipGap
          : bottomAnchor
            ? triggerRect.bottom - tooltipRect.height
            : triggerRect.top - tooltipGap - tooltipRect.height;

      const alternateTop =
        placement === "bottom"
          ? triggerRect.top - tooltipGap - tooltipRect.height
          : triggerRect.bottom + tooltipGap;

      const preferredFits =
        preferredTop >= viewportPadding &&
        preferredTop + tooltipRect.height <= viewportHeight - viewportPadding;
      const alternateFits =
        alternateTop >= viewportPadding &&
        alternateTop + tooltipRect.height <= viewportHeight - viewportPadding;

      let top = preferredTop;
      if (!preferredFits && alternateFits) {
        top = alternateTop;
      }
      if (!preferredFits && !alternateFits) {
        top = Math.max(
          viewportPadding,
          Math.min(
            preferredTop,
            viewportHeight - viewportPadding - tooltipRect.height,
          ),
        );
      }

      setTooltipStyle({ left, top });
    };

    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);

    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [align, bottomAnchor, mounted, placement, visible]);

  const tooltipClasses =
    `fixed z-[1000] w-max max-w-[min(36rem,calc(100vw-2rem))] whitespace-normal break-words rounded px-3 py-2 text-xs leading-relaxed shadow-lg transition-opacity duration-200` +
    (visible ? " opacity-100" : " opacity-0") +
    " bg-blue-50/62 text-sky-900 dark:bg-blue-900/62 dark:text-white normal-case tracking-normal font-normal";

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {children}

      {mounted
        ? createPortal(
            <span
              ref={tooltipRef}
              role="status"
              className={tooltipClasses}
              style={tooltipStyle}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
