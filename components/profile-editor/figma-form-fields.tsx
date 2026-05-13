"use client";

import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

/** Matches Figma: padding 9px 12px, border #E8E8E8, focus #2F80ED + ring */
export const FigmaTextInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
>(function FigmaTextInput({ className, onFocus, onBlur, style, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      ref={ref}
      {...rest}
      className={cn(
        "w-full min-w-0 rounded-xl text-base focus:outline-none sm:text-[14px]",
        className
      )}
      style={{
        padding: "11px 14px",
        border: `1px solid ${focused ? "rgba(51,65,85,0.55)" : "rgba(148,163,184,0.45)"}`,
        color: "#0f172a",
        background: "rgba(255,255,255,0.92)",
        transition: "border-color 120ms ease, box-shadow 120ms ease, background 120ms ease",
        boxShadow: focused ? "0 0 0 3px rgba(15,23,42,0.06)" : "0 1px 0 rgba(255,255,255,0.75) inset",
        ...style,
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
});

export const FigmaTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }
>(function FigmaTextarea({ className, onFocus, onBlur, style, rows = 2, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...rest}
      className={cn(
        "w-full min-w-0 resize-none rounded-xl text-base focus:outline-none sm:text-[14px]",
        className
      )}
      style={{
        padding: "11px 14px",
        border: `1px solid ${focused ? "rgba(51,65,85,0.55)" : "rgba(148,163,184,0.45)"}`,
        color: "#0f172a",
        background: "rgba(255,255,255,0.92)",
        transition: "border-color 120ms ease, box-shadow 120ms ease, background 120ms ease",
        boxShadow: focused ? "0 0 0 3px rgba(15,23,42,0.06)" : "0 1px 0 rgba(255,255,255,0.75) inset",
        lineHeight: 1.5,
        ...style,
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
});
