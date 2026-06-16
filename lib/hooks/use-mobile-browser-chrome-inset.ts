"use client";

import { useEffect } from "react";

const ROOT_SELECTOR = ".yd-workspace";

/** iOS Safari: dynamic bottom toolbar is not always reflected in env(safe-area-inset-bottom). */
function readBrowserBottomInset(): number {
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, Math.round(window.innerHeight - vv.offsetTop - vv.height));
}

function applyBrowserBottomInset(root: HTMLElement): void {
  root.style.setProperty("--yd-browser-bottom-inset", `${readBrowserBottomInset()}px`);
}

/**
 * Keeps mobile bottom navigation above Safari's dynamic bottom UI by syncing
 * `--yd-browser-bottom-inset` on the workspace shell.
 */
export function useMobileBrowserChromeInset(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
    if (!root) return;

    const update = () => applyBrowserBottomInset(root);

    update();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      root.style.removeProperty("--yd-browser-bottom-inset");
    };
  }, [enabled]);
}
