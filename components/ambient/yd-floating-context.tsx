"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type YdFloatingContextProps = {
  children: ReactNode;
  preview: ReactNode;
  /** Disable on touch-primary devices to avoid stuck overlays */
  disabled?: boolean;
};

/**
 * Floating OS context layer — stable layout, no card resize.
 */
export function YdFloatingContext({
  children,
  preview,
  disabled = false,
}: YdFloatingContextProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 260, placeAbove: false });

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => setCoarsePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(300, Math.max(228, r.width));
    const left = Math.min(
      Math.max(12, r.left),
      typeof window !== "undefined" ? window.innerWidth - width - 12 : r.left
    );
    const belowTop = r.bottom + 12;
    const panelH = 148;
    const placeAbove =
      typeof window !== "undefined" &&
      belowTop + panelH > window.innerHeight - 16;
    const top = placeAbove ? r.top - panelH - 12 : belowTop;
    setPos({ top, left, width, placeAbove });
  }, []);

  const show = () => {
    if (disabled || coarsePointer) return;
    updatePosition();
    setVisible(true);
  };

  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [visible, updatePosition]);

  return (
    <>
      <div
        ref={anchorRef}
        className="yd-floating-anchor relative h-full w-full min-w-0"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {mounted && visible && !disabled && !coarsePointer
        ? createPortal(
            <div
              className="yd-floating-context-surface"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: pos.width,
                zIndex: 200,
              }}
              role="tooltip"
              onMouseEnter={show}
              onMouseLeave={hide}
            >
              {preview}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
