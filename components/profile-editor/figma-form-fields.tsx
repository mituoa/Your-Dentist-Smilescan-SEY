"use client";

import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

type FieldVariant = "default" | "quiet";

/** Standard: dezente Karte. Quiet: fast unsichtbar — nur Grundlinie, für Kuratier-Spalte. */
export const FigmaTextInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { className?: string; variant?: FieldVariant }
>(function FigmaTextInput({ className, onFocus, onBlur, style, variant = "default", ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  const quiet = variant === "quiet";

  return (
    <input
      ref={ref}
      {...rest}
      className={cn(
        "w-full min-w-0 text-base focus:outline-none sm:text-[13px]",
        quiet ? "rounded-none bg-transparent py-2.5 pl-0 pr-1" : "rounded-xl sm:text-[14px]",
        className
      )}
      style={
        quiet
          ? {
              border: "none",
              borderBottom: `1px solid ${
                focused ? "rgba(51,65,85,0.45)" : "rgba(148,163,184,0.28)"
              }`,
              borderRadius: 0,
              color: "#0f172a",
              background: "transparent",
              transition: "border-color 140ms ease",
              ...style,
            }
          : {
              padding: "11px 14px",
              border: `1px solid ${focused ? "rgba(51,65,85,0.55)" : "rgba(148,163,184,0.45)"}`,
              color: "#0f172a",
              background: "rgba(255,255,255,0.92)",
              transition: "border-color 120ms ease, box-shadow 120ms ease, background 120ms ease",
              boxShadow: focused ? "0 0 0 3px rgba(15,23,42,0.06)" : "0 1px 0 rgba(255,255,255,0.75) inset",
              ...style,
            }
      }
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
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string; variant?: FieldVariant }
>(function FigmaTextarea({ className, onFocus, onBlur, style, rows = 2, variant = "default", ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  const quiet = variant === "quiet";

  return (
    <textarea
      ref={ref}
      rows={rows}
      {...rest}
      className={cn(
        "w-full min-w-0 resize-none text-base focus:outline-none sm:text-[13px]",
        quiet ? "rounded-none bg-transparent py-2.5 pl-0 pr-1" : "rounded-xl sm:text-[14px]",
        className
      )}
      style={
        quiet
          ? {
              border: "none",
              borderBottom: `1px solid ${
                focused ? "rgba(51,65,85,0.45)" : "rgba(148,163,184,0.28)"
              }`,
              borderRadius: 0,
              color: "#0f172a",
              background: "transparent",
              transition: "border-color 140ms ease",
              lineHeight: 1.55,
              ...style,
            }
          : {
              padding: "11px 14px",
              border: `1px solid ${focused ? "rgba(51,65,85,0.55)" : "rgba(148,163,184,0.45)"}`,
              color: "#0f172a",
              background: "rgba(255,255,255,0.92)",
              transition: "border-color 120ms ease, box-shadow 120ms ease, background 120ms ease",
              boxShadow: focused ? "0 0 0 3px rgba(15,23,42,0.06)" : "0 1px 0 rgba(255,255,255,0.75) inset",
              lineHeight: 1.5,
              ...style,
            }
      }
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
