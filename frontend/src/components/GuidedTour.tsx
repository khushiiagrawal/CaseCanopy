"use client";

import { useEffect, useState } from "react";

const steps = [
  {
    selector: ".navbar-signup",
    content: "Sign up to unlock our features: AI-powered legal research, case analysis, document management and more! Get started on your journey to smarter legal discovery.",
  },
];

export default function GuidedTour() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show the tour if not already completed
    if (typeof window !== "undefined" && !localStorage.getItem("guidedTourDone")) {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const el = document.querySelector(steps[0]?.selector);
    console.log('GuidedTour: .navbar-signup element:', el);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [show]);

  if (!show) return null;

  const el = typeof window !== "undefined" ? document.querySelector(steps[0].selector) : null;
  const rect = el ? el.getBoundingClientRect() : null;

  // Responsive tooltip positioning
  let tooltipWidth = 340;
  const tooltipHeight = 100;
  let left = 0;
  let top = 0;
  let isMobile = false;
  if (rect) {
    isMobile = window.innerWidth < 640;
    if (isMobile) {
      tooltipWidth = Math.min(window.innerWidth - 32, 340);
      left = (window.innerWidth - tooltipWidth) / 2;
      top = rect.bottom + 12;
    } else {
      left = Math.min(rect.left + rect.width - tooltipWidth, window.innerWidth - tooltipWidth - 16);
      top = rect.bottom + 16;
    }
  }

  return rect ? (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      {/* Overlay */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9998,
      }} />
      {/* Highlighted element border */}
      <div style={{
        position: "fixed",
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
        border: "3px solid #D4AF37",
        borderRadius: 8,
        boxSizing: "border-box",
        zIndex: 10000,
        pointerEvents: "none",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      }} />
      {/* Tooltip below and right-aligned */}
      <div style={{
        position: "fixed",
        top: top,
        left: left,
        width: tooltipWidth,
        minHeight: tooltipHeight,
        background: "#232323",
        color: "#fff",
        padding: isMobile ? "14px 10px" : "18px 24px",
        borderRadius: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        zIndex: 10001,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: "95vw",
      }}>
        <div style={{ fontSize: 18, marginBottom: 12 }}>{steps[0].content}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={() => { setShow(false); localStorage.setItem("guidedTourDone", "1"); }} style={{ padding: "6px 16px", borderRadius: 4, background: "#D4AF37", color: "#000", border: "none", cursor: "pointer", fontWeight: 600 }}>Got it!</button>
        </div>
      </div>
    </div>
  ) : null;
} 