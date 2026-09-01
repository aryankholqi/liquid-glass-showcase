"use client";

import { useEffect } from "react";

/**
 * Loads Tailwind's in-browser compiler so utility classes typed into the
 * playground's `layerClassName` field take effect live in the preview.
 *
 * The `<style type="text/tailwindcss">` entry point pulls in the theme and the
 * utilities only — no Preflight — so Tailwind never resets the showcase's own
 * hand-written CSS. The compiler watches the DOM and rebuilds whenever a new
 * class appears, so anything the user types is compiled on the next keystroke.
 */
export function TailwindJit() {
  useEffect(() => {
    if (!document.getElementById("tw-jit-entry")) {
      const style = document.createElement("style");
      style.id = "tw-jit-entry";
      style.setAttribute("type", "text/tailwindcss");
      style.textContent = '@import "tailwindcss/theme.css";\n@import "tailwindcss/utilities.css";';
      document.head.appendChild(style);
    }
    // Self-executing IIFE build — the dynamic import is cached, so a second
    // mount (e.g. React strict mode) is a no-op.
    void import("@tailwindcss/browser");
  }, []);

  return null;
}
