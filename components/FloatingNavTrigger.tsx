"use client";

import { useState, useEffect } from "react";

//It's a client component that handles its own visibility state based on scroll position and toggles a floating button
export default function FloatingNavTrigger() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button if user scrolls down more than 0px
      if (window.scrollY > 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      style={floatBarStyles}
      aria-label="Back to top"
    >
      {/* This icon represents the menu/nav returning */}
      <span style={{ fontSize: "20px" }}>↑</span>
      <span style={{ marginLeft: "8px", fontSize: "14px" }}>Show Nav</span>
    </button>
  );
}

const floatBarStyles: React.CSSProperties = {
  position: "fixed",
  top: "20px",
  right: "20px",
  padding: "10px 20px",
  backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
  color: "white",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  display: "flex",
  alignItems: "center",
  zIndex: 9999, // Extremely high to stay on top
};
